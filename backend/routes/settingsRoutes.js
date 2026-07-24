import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const settingsRouter = Router();

settingsRouter.use(requireAuth);
settingsRouter.get('/', getSettings);
settingsRouter.put('/', updateSettings);
