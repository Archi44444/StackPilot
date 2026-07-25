import { env } from '../config/env.js';
import { GoogleGenAI } from '@google/genai';
import { randomUUID } from 'crypto';

const documents = []; // Memory fallback when Chroma is not configured.
const vectors = []; // { docId, chunkId, content, embedding, uid, source }

let geminiClient;
function getGeminiClient() {
  if (!geminiClient && env.ai.geminiApiKey) {
    geminiClient = new GoogleGenAI({ apiKey: env.ai.geminiApiKey });
  }
  return geminiClient;
}

export function chunkText(text, maxChars = 1000) {
  const chunks = [];
  let currentChunk = '';
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChars) {
      if (currentChunk.trim()) chunks.push(currentChunk.trim());
      currentChunk = sentence + ' ';
    } else {
      currentChunk += sentence + ' ';
    }
  }
  if (currentChunk.trim()) chunks.push(currentChunk.trim());
  return chunks;
}

async function generateEmbeddings(texts) {
  const client = getGeminiClient();
  if (!client) return null;
  
  // Try multiple model names in order of preference
  const models = ['text-embedding-004', 'models/text-embedding-004', 'gemini-embedding-exp-03-07'];
  for (const model of models) {
    try {
      const result = await client.models.embedContent({
        model,
        contents: texts.map(text => ({ parts: [{ text }] }))
      });
      return result.embeddings.map(e => e.values);
    } catch {
      // Try next model name
    }
  }
  return null; // All models failed
}

export async function addKnowledgeSource(uid, source, content) {
  const docId = source.id || randomUUID();
  documents.push({ id: docId, filename: source.title, content, uid, source });
  const chunks = chunkText(content);
  const embeddings = await generateEmbeddings(chunks);
  chunks.forEach((chunk, index) => vectors.push({ docId, chunkId: randomUUID(), content: chunk, embedding: embeddings?.[index] ?? [], uid, source }));
  return { id: docId, ...source, chunkCount: chunks.length };
}

export async function addDocument(uid, filename, content) {
  const docId = randomUUID();
  await addKnowledgeSource(uid, { id: docId, type: 'upload', title: filename }, content);
  return { id: docId, filename, type: 'upload' };
}

export async function listDocuments(uid) {
  return documents.filter((doc) => doc.uid === uid).map(d => ({ id: d.id, filename: d.filename }));
}

export async function getDocument(uid, id) {
  const document = documents.find((item) => item.id === id && item.uid === uid);
  return document ? { ...document } : null;
}

export async function deleteDocument(uid, id) {
  await deleteKnowledgeSource(uid, id);
}

export async function deleteKnowledgeSource(uid, id) {
  const docIndex = documents.findIndex((doc) => doc.id === id && doc.uid === uid);
  if (docIndex !== -1) {
    documents.splice(docIndex, 1);
    const vectorIndexes = vectors.map((v, i) => v.docId === id ? i : -1).filter(i => i !== -1).reverse();
    vectorIndexes.forEach(index => vectors.splice(index, 1));
  }
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA.length || !vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function generateQueryEmbedding(query) {
  const client = getGeminiClient();
  if (!client) return null;
  
  const models = ['text-embedding-004', 'models/text-embedding-004', 'gemini-embedding-exp-03-07'];
  for (const model of models) {
    try {
      const result = await client.models.embedContent({
        model,
        contents: [{ parts: [{ text: query }] }]
      });
      return result.embeddings[0].values;
    } catch {
      // Try next model
    }
  }
  return null;
}

function keywordSearch(uid, query) {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  const userDocIds = documents.filter(d => d.uid === uid).map(d => d.id);
  const userVectors = vectors.filter(v => userDocIds.includes(v.docId));
  
  const scored = userVectors.map(v => {
    let score = 0;
    const content = v.content.toLowerCase();
    for (const kw of keywords) {
      if (content.includes(kw)) score++;
    }
    return { ...v, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export async function retrieveRelevantChunks(uid, query, topK = 4) {
  // Try vector search first
  if (vectors.some(v => v.embedding.length > 0)) {
    try {
      const queryEmbedding = await generateQueryEmbedding(query);
      if (queryEmbedding) {
        const userDocIds = documents.filter(d => d.uid === uid).map(d => d.id);
        const userVectors = vectors.filter(v => userDocIds.includes(v.docId));
        
        const scored = userVectors.map(v => ({
          ...v,
          score: cosineSimilarity(queryEmbedding, v.embedding),
        }));
        
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK).map(s => ({ content: s.content, source: s.source ?? { id: s.docId, type: 'upload', title: documents.find((d) => d.id === s.docId)?.filename || 'Uploaded document' }, score: s.score }));
      }
    } catch {
      // Fall through to keyword search
    }
  }
  
  // Fallback: keyword search
  const results = keywordSearch(uid, query);
  return results.slice(0, topK).map(s => ({ content: s.content, source: s.source ?? { id: s.docId, type: 'upload', title: documents.find((d) => d.id === s.docId)?.filename || 'Uploaded document' }, score: s.score }));
}
