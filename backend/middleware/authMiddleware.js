import { getFirebaseAuth } from '../config/firebaseAdmin.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';

export const requireAuth = asyncHandler(async (request, _response, next) => {
  const authorization = request.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new AppError('A Firebase ID token is required.', { statusCode: 401, code: 'UNAUTHENTICATED' });
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError('A Firebase ID token is required.', { statusCode: 401, code: 'UNAUTHENTICATED' });
  }

  try {
    // Standard verification validates the token signature, issuer, audience, and
    // expiry. Revocation checks make an additional privileged Auth API call and
    // were rejecting valid fresh tokens for this project's service account.
    const decoded = await getFirebaseAuth().verifyIdToken(token);
    request.user = { uid: decoded.uid, email: decoded.email ?? null, name: decoded.name ?? null };
    next();
  } catch (error) {
    logger.warn('Firebase ID token verification failed', {
      reason: error?.message,
      firebaseCode: error?.code,
    });
    throw new AppError('The Firebase ID token is invalid or expired.', { statusCode: 401, code: 'UNAUTHENTICATED' });
  }
});
