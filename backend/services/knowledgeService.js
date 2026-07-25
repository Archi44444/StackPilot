import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebaseAdmin.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { addKnowledgeSource, deleteKnowledgeSource } from '../rag/vectorStore.js';

const textExtensions = /\.(md|mdx|txt|json|ya?ml|js|jsx|ts|tsx|py|java|go|rb|php|css|html)$/i;
const githubUrl = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?(?:#.*)?$/i;
const asJson = async (response, label) => {
  if (!response.ok) throw new AppError(`${label} could not be fetched.`, { statusCode: response.status === 404 ? 404 : 502, code: 'UPSTREAM_REQUEST_FAILED' });
  return response.json();
};
const headers = () => ({ Accept: 'application/vnd.github+json', ...(env.githubToken ? { Authorization: `Bearer ${env.githubToken}` } : {}) });
const serialize = (snapshot) => ({ id: snapshot.id, ...snapshot.data(), createdAt: snapshot.data().createdAt?.toDate?.().toISOString?.() ?? null });

export async function importRepository(uid, url) {
  const match = url.match(githubUrl);
  if (!match) throw new AppError('Enter a valid public GitHub repository URL.', { statusCode: 400, code: 'INVALID_GITHUB_URL' });
  const [, owner, repoName] = match;
  const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers: headers() });
  if (repoResponse.status === 403 || repoResponse.status === 429) {
    throw new AppError('GitHub is rate-limiting anonymous imports. Add GITHUB_TOKEN to backend/.env and restart the backend.', { statusCode: 429, code: 'GITHUB_RATE_LIMITED' });
  }
  const repo = await asJson(repoResponse, 'Repository');
  const existing = await getDb().collection('repositories').where('uid', '==', uid).where('fullName', '==', repo.full_name).limit(1).get();
  if (!existing.empty) return serialize(existing.docs[0]);
  const [tree, readme] = await Promise.all([
    asJson(await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/${repo.default_branch}?recursive=1`, { headers: headers() }), 'Repository tree'),
    fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, { headers: headers() }).then(async (response) => response.ok ? response.json() : null),
  ]);
  const files = tree.tree.filter((entry) => entry.type === 'blob' && textExtensions.test(entry.path)).slice(0, 80);
  const contents = await Promise.all(files.map(async (file) => {
    const data = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`, { headers: headers() });
    if (!data.ok) return null;
    const body = await data.json();
    if (body.size > 180_000 || !body.content) return null;
    return { name: file.path, text: Buffer.from(body.content, 'base64').toString('utf8') };
  }));
  const readmeText = readme?.content ? Buffer.from(readme.content, 'base64').toString('utf8') : '';
  const reference = getDb().collection('repositories').doc();
  const source = { id: reference.id, type: 'repository', title: repo.full_name, url: repo.html_url, metadata: { description: repo.description, language: repo.language, defaultBranch: repo.default_branch } };
  const text = [`# ${repo.full_name}`, repo.description || '', `## README\n${readmeText}`, ...contents.filter(Boolean).map((file) => `## File: ${file.name}\n${file.text}`)].join('\n\n');
  await addKnowledgeSource(uid, source, text);
  await reference.set({ uid, fullName: repo.full_name, name: repo.name, url: repo.html_url, description: repo.description || '', language: repo.language || null, stars: repo.stargazers_count, fileCount: files.length, sourceId: source.id, createdAt: FieldValue.serverTimestamp() });
  await getDb().collection('activity').add({ uid, type: 'repository_imported', title: `Imported ${repo.full_name}`, createdAt: FieldValue.serverTimestamp() });
  return serialize(await reference.get());
}

export async function importDocumentation(uid, url) {
  const parsed = new URL(url);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new AppError('Enter a valid documentation URL.', { statusCode: 400, code: 'INVALID_DOCUMENTATION_URL' });
  const existing = await getDb().collection('documentation').where('uid', '==', uid).where('url', '==', parsed.href).limit(1).get();
  if (!existing.empty) return serialize(existing.docs[0]);
  const readerUrl = `https://r.jina.ai/${parsed.href}`;
  const response = await fetch(readerUrl, { headers: env.jinaApiKey ? { Authorization: `Bearer ${env.jinaApiKey}` } : {} });
  if (!response.ok) throw new AppError('Documentation could not be read. Check that the page is public.', { statusCode: 502, code: 'DOCUMENTATION_FETCH_FAILED' });
  const content = (await response.text()).slice(0, 500_000);
  if (content.trim().length < 80) throw new AppError('No readable documentation was found at that URL.', { statusCode: 422, code: 'DOCUMENTATION_EMPTY' });
  const reference = getDb().collection('documentation').doc();
  const title = parsed.hostname.replace(/^www\./, '');
  await addKnowledgeSource(uid, { id: reference.id, type: 'documentation', title, url: parsed.href }, content);
  await reference.set({ uid, url: parsed.href, title, sourceId: reference.id, characterCount: content.length, createdAt: FieldValue.serverTimestamp() });
  await getDb().collection('activity').add({ uid, type: 'documentation_imported', title: `Imported ${title}`, createdAt: FieldValue.serverTimestamp() });
  return serialize(await reference.get());
}

export async function listKnowledge(uid, collection) { const snapshots = await getDb().collection(collection).where('uid', '==', uid).orderBy('createdAt', 'desc').get(); return snapshots.docs.map(serialize); }
export async function deleteKnowledge(uid, collection, id) { const ref = getDb().collection(collection).doc(id); const snapshot = await ref.get(); if (!snapshot.exists || snapshot.data().uid !== uid) throw new AppError('The requested resource was not found.', { statusCode: 404, code: 'NOT_FOUND' }); await deleteKnowledgeSource(uid, snapshot.data().sourceId || id); await ref.delete(); }

export async function searchStackOverflow(query, limit) {
  const params = new URLSearchParams({ order: 'desc', sort: 'relevance', q: query, site: 'stackoverflow', pagesize: String(limit), filter: 'withbody' });
  const data = await asJson(await fetch(`https://api.stackexchange.com/2.3/search/advanced?${params}`), 'Stack Overflow');
  return (data.items || []).map((item) => ({ title: item.title, link: item.link, score: item.score, tags: item.tags, accepted: Boolean(item.accepted_answer_id), excerpt: (item.body_markdown || item.body || '').replace(/<[^>]+>/g, '').slice(0, 700) }));
}
