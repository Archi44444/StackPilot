import { asyncHandler } from '../utils/asyncHandler.js';
import { deleteKnowledge, importDocumentation, importRepository, listKnowledge, searchStackOverflow } from '../services/knowledgeService.js';
import { getDb } from '../config/firebaseAdmin.js';

export const importRepo = asyncHandler(async (req, res) => res.status(201).json({ data: await importRepository(req.user.uid, req.validated.body.url) }));
export const listRepos = asyncHandler(async (req, res) => res.json({ data: await listKnowledge(req.user.uid, 'repositories') }));
export const deleteRepo = asyncHandler(async (req, res) => { await deleteKnowledge(req.user.uid, 'repositories', req.validated.params.id); res.status(204).send(); });
export const importDocs = asyncHandler(async (req, res) => res.status(201).json({ data: await importDocumentation(req.user.uid, req.validated.body.url) }));
export const listDocs = asyncHandler(async (req, res) => res.json({ data: await listKnowledge(req.user.uid, 'documentation') }));
export const deleteDocs = asyncHandler(async (req, res) => { await deleteKnowledge(req.user.uid, 'documentation', req.validated.params.id); res.status(204).send(); });
export const stackOverflow = asyncHandler(async (req, res) => res.json({ data: await searchStackOverflow(req.validated.query.q, req.validated.query.limit) }));
export const dashboard = asyncHandler(async (req, res) => {
  const db = getDb();
  const uid = req.user.uid;
  const collections = ['repositories', 'documentation', 'documents', 'prompts', 'conversations'];
  const [repositories, documentation, documents, prompts, conversations, activity] = await Promise.all([
    ...collections.map(async (collection) => (await db.collection(collection).where('uid', '==', uid).get()).size),
    // Sorting in application code means analytics works immediately, even before
    // the optional uid + createdAt Firestore index has finished building.
    db.collection('activity').where('uid', '==', uid).get(),
  ]);
  const recentActivity = activity.docs
    .map((item) => ({ id: item.id, ...item.data(), createdAt: item.data().createdAt?.toDate?.().toISOString?.() ?? null }))
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, 8);
  res.json({ data: { repositories, documentation, documents, prompts, conversations, storageUsage: 0, recentActivity } });
});
