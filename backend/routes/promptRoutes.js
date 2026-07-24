import { Router } from 'express';
import { createPrompt, deletePrompt, listPrompts, updatePrompt } from '../controllers/promptController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { paginationRequestSchema, promptCreateRequestSchema, promptUpdateRequestSchema, resourceIdRequestSchema } from '../models/schemas.js';

export const promptRouter = Router();

promptRouter.use(requireAuth);
promptRouter.post('/', validateRequest(promptCreateRequestSchema), createPrompt);
promptRouter.get('/', validateRequest(paginationRequestSchema), listPrompts);
promptRouter.put('/:id', validateRequest(promptUpdateRequestSchema), updatePrompt);
promptRouter.delete('/:id', validateRequest(resourceIdRequestSchema), deletePrompt);
