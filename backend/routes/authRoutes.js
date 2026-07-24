import { Router } from 'express';
import { deleteAccount, getCurrentUser, syncUser } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { syncUserRequestSchema } from '../models/schemas.js';

export const authRouter = Router();

authRouter.use(requireAuth);
authRouter.post('/sync', validateRequest(syncUserRequestSchema), syncUser);
authRouter.get('/me', getCurrentUser);
authRouter.delete('/account', deleteAccount);
