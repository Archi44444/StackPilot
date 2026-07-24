import 'dotenv/config';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info('API server listening', { port: env.port, environment: env.nodeEnv });
});

const shutdown = (signal) => {
  logger.info('Shutdown signal received', { signal });
  server.close((error) => {
    if (error) {
      logger.error('Failed to close HTTP server', { error: error.message });
      process.exitCode = 1;
    }
    process.exit();
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
