import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const handler = (request, response) => response.status(429).json({
  error: {
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again shortly.',
    requestId: request.id,
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.rateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
});

export const aiRateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  limit: env.aiRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
});
