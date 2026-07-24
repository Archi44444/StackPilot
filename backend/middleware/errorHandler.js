import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(request, _response, next) {
  next(new AppError(`Route ${request.method} ${request.originalUrl} was not found.`, {
    statusCode: 404,
    code: 'NOT_FOUND',
  }));
}

export function errorHandler(error, request, response, _next) {
  let normalized = error;

  if (error instanceof ZodError) {
    normalized = new AppError('The request is invalid.', {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      details: error.flatten(),
    });
  } else if (error && error.name === 'MulterError') {
    normalized = new AppError('The uploaded file is invalid.', {
      statusCode: 400,
      code: error.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
    });
  } else if (!(error instanceof AppError)) {
    normalized = new AppError('An unexpected error occurred.');
  }

  const logContext = {
    requestId: request.id,
    method: request.method,
    path: request.originalUrl,
    code: normalized.code,
  };
  if (normalized.statusCode >= 500) logContext.stack = error.stack;
  logger[normalized.statusCode >= 500 ? 'error' : 'warn'](normalized.message, logContext);

  const payload = {
    error: {
      code: normalized.code,
      message: normalized.statusCode >= 500 ? 'Internal server error.' : normalized.message,
      requestId: request.id,
    },
  };
  // Include details for all errors when available, not just sub-500 errors
  if (normalized.details) {
    payload.error.details = normalized.details;
  }
  response.status(normalized.statusCode).json(payload);
}
