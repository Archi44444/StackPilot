import { z } from 'zod';

const emptyObject = z.object({}).strict();
const idParams = z.object({ id: z.string().min(1).max(128) });

export const syncUserRequestSchema = z.object({
  body: z.object({
    displayName: z.string().trim().min(1).max(80).optional(),
    photoURL: z.string().url().max(2048).optional(),
  }).strict(),
  params: emptyObject,
  query: emptyObject,
});

export const chatRequestSchema = z.object({
  body: z.object({
    conversationId: z.string().min(1).max(128).optional(),
    message: z.string().trim().min(1).max(20_000),
    mode: z.enum(['chat', 'debug', 'explain', 'improve', 'optimize', 'refactor', 'convert', 'test', 'document']).default('chat'),
    documentId: z.string().min(1).max(128).optional(),
    model: z.string().trim().min(1).max(128).optional(),
    temperature: z.number().min(0).max(2).optional(),
  }).strict(),
  params: emptyObject,
  query: emptyObject,
});

export const promptCreateRequestSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120),
    content: z.string().trim().min(1).max(20_000),
    category: z.string().trim().min(1).max(60),
  }).strict(),
  params: emptyObject,
  query: emptyObject,
});

export const promptUpdateRequestSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).max(120).optional(),
    content: z.string().trim().min(1).max(20_000).optional(),
    category: z.string().trim().min(1).max(60).optional(),
  }).strict().refine((body) => Object.keys(body).length > 0, 'Provide at least one field to update.'),
  params: idParams,
  query: emptyObject,
});

export const resourceIdRequestSchema = z.object({
  body: emptyObject,
  params: idParams,
  query: emptyObject,
});

export const paginationRequestSchema = z.object({
  body: emptyObject,
  params: emptyObject,
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(30),
    cursor: z.string().min(1).max(512).optional(),
  }).strict(),
});

export const messagesRequestSchema = z.object({
  body: emptyObject,
  params: idParams,
  query: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: z.string().min(1).max(512).optional(),
  }).strict(),
});

export const importRepositoryRequestSchema = z.object({
  body: z.object({ url: z.string().url().max(2048) }).strict(), params: emptyObject, query: emptyObject,
});

export const importDocumentationRequestSchema = z.object({
  body: z.object({ url: z.string().url().max(2048) }).strict(), params: emptyObject, query: emptyObject,
});

export const stackOverflowSearchRequestSchema = z.object({
  body: emptyObject, params: emptyObject,
  query: z.object({ q: z.string().trim().min(2).max(500), limit: z.coerce.number().int().min(1).max(10).default(5) }).strict(),
});

export const taskCreateRequestSchema = z.object({
  body: z.object({
    ai_assisted: z.union([z.literal(0), z.literal(1)]),
    task_difficulty: z.number().int().min(1).max(5),
    developer_experience: z.number().int().min(1).max(10),
    language: z.enum(['JavaScript', 'TypeScript', 'Python', 'Go', 'Other']),
    task_type: z.enum(['bug_fix', 'feature', 'refactor', 'docs', 'other']),
    completion_time: z.number().positive().max(480),
  }).strict(),
  params: emptyObject,
  query: emptyObject,
});

export const fineTuneGenerateRequestSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(20_000),
    conversationId: z.string().min(1).max(128).optional(),
  }).strict(),
  params: emptyObject,
  query: emptyObject,
});
