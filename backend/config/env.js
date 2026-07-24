import { z } from 'zod';

const parseCsv = (value, fallback) => (value ?? fallback)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const rawSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(30),
  AI_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  MAX_FILE_SIZE_MB: z.coerce.number().positive().max(50).default(20),
  ALLOWED_FILE_TYPES: z.string().default('pdf,md,txt'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['gemini', 'openrouter']).default('gemini'),
  GEMINI_API_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().min(1).optional(),
});

const raw = rawSchema.parse(process.env);

export const env = Object.freeze({
  nodeEnv: raw.NODE_ENV,
  port: raw.PORT,
  corsOrigins: parseCsv(raw.CORS_ORIGIN, 'http://localhost:5173'),
  rateLimitWindowMs: raw.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: raw.RATE_LIMIT_MAX,
  aiRateLimitMax: raw.AI_RATE_LIMIT_MAX,
  maxFileSizeBytes: raw.MAX_FILE_SIZE_MB * 1024 * 1024,
  allowedFileTypes: parseCsv(raw.ALLOWED_FILE_TYPES, 'pdf,md,txt').map((type) => type.toLowerCase()),
  firebase: {
    projectId: raw.FIREBASE_PROJECT_ID,
    clientEmail: raw.FIREBASE_CLIENT_EMAIL,
    privateKey: raw.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  ai: {
    provider: raw.AI_PROVIDER,
    geminiApiKey: raw.GEMINI_API_KEY,
    openRouterApiKey: raw.OPENROUTER_API_KEY,
    openRouterModel: raw.OPENROUTER_MODEL,
  },
});
