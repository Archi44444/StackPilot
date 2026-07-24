import { AppError } from '../utils/AppError.js';

export function notImplemented(feature) {
  return (_request, _response, next) => next(new AppError(`${feature} is scheduled for a later implementation phase.`, {
    statusCode: 501,
    code: 'NOT_IMPLEMENTED',
  }));
}
