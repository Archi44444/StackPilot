import { AppError } from '../utils/AppError.js';

export function validateRequest(schema) {
  return (request, _response, next) => {
    const result = schema.safeParse({
      body: request.body ?? {},
      params: request.params ?? {},
      query: request.query ?? {},
    });
    if (!result.success) {
      console.error('[Validation Error]', result.error.flatten());
      next(new AppError('The request is invalid.', {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: result.error.flatten(),
      }));
      return;
    }
    request.validated = result.data;
    next();
  };
}
