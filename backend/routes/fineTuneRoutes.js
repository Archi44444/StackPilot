import { Router } from 'express';
import { generateFineTuned } from '../controllers/fineTuneController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { fineTuneGenerateRequestSchema } from '../models/schemas.js';

export const fineTuneRouter = Router();

fineTuneRouter.use(requireAuth);
fineTuneRouter.post('/generate', validateRequest(fineTuneGenerateRequestSchema), generateFineTuned);
