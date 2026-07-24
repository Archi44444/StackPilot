import winston from 'winston';
import { env } from '../config/env.js';

const { combine, timestamp, json, colorize, simple } = winston.format;
const format = env.nodeEnv === 'production'
  ? combine(timestamp(), json())
  : combine(colorize(), timestamp(), simple());

export const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  format,
  defaultMeta: { service: 'ai-developer-copilot-api' },
  transports: [new winston.transports.Console()],
});
