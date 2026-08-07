import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { attachRequestId } from './middleware/requestId.js';
import { authRouter } from './routes/authRoutes.js';
import { chatRouter } from './routes/chatRoutes.js';
import { documentRouter } from './routes/documentRoutes.js';
import { promptRouter } from './routes/promptRoutes.js';
import { settingsRouter } from './routes/settingsRoutes.js';
import { knowledgeRouter } from './routes/knowledgeRoutes.js';
import { taskRouter } from './routes/taskRoutes.js';
import { AppError } from './utils/AppError.js';
import { logger } from './utils/logger.js';

const corsOptions = {
  origin(origin, callback) {
    if (!origin || env.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new AppError('Origin is not allowed by CORS policy.', {
      statusCode: 403,
      code: 'CORS_ORIGIN_DENIED',
    }));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
};

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(attachRequestId);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(morgan('combined', { stream: { write: (message) => logger.http(message.trim()) } }));

  app.get('/health', (_request, response) => {
    response.status(200).json({ data: { status: 'ok', service: 'ai-developer-copilot-api' } });
  });

  const api = express.Router();
  api.use(apiRateLimiter);
  api.use('/auth', authRouter);
  api.use('/chat', chatRouter);
  api.use('/documents', documentRouter);
  // Backwards-compatible direct upload endpoint for API clients.
  api.use('/upload', documentRouter);
  api.use('/prompts', promptRouter);
  api.use('/settings', settingsRouter);
  api.use('/', knowledgeRouter);
  api.use('/tasks', taskRouter);
  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
