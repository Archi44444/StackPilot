import { z } from 'zod';
import { readFileSync } from 'node:fs';

function recoverMultilinePrivateKey() {
  const configured = process.env.FIREBASE_PRIVATE_KEY;
  if (configured?.includes('END PRIVATE KEY')) return configured;

  try {
    const dotenv = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    const match = dotenv.match(/^FIREBASE_PRIVATE_KEY=(.*?)(?=^[A-Z][A-Z0-9_]*=|(?![\s\S]))/ms);
    if (!match) return configured;
    const value = match[1].trim().replace(/^"|"$/g, '');
    return value.replace(/\r?\n/g, '\\n');
  } catch {
    return configured;
  }
}

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
  GITHUB_TOKEN: z.string().min(1).optional(),
  JINA_API_KEY: z.string().min(1).optional(),
  CHROMA_URL: z.string().url().optional(),
  HF_MODEL: z.string().default('Qwen/Qwen2.5-0.5B-Instruct'),
  HF_API_TOKEN: z.string().optional(),
});

const raw = rawSchema.parse({ ...process.env, FIREBASE_PRIVATE_KEY: recoverMultilinePrivateKey() });

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
  githubToken: raw.GITHUB_TOKEN,
  jinaApiKey: raw.JINA_API_KEY,
  chromaUrl: raw.CHROMA_URL,
  hfModel: raw.HF_MODEL,
  hfApiToken: raw.HF_API_TOKEN,
});
