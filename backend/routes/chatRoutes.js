import { Router } from 'express';
import { clearConversationHistory, deleteConversation, listConversationHistory, listMessages, streamChat } from '../controllers/chatController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { chatRequestSchema, messagesRequestSchema, paginationRequestSchema, resourceIdRequestSchema } from '../models/schemas.js';

export const chatRouter = Router();

chatRouter.use(requireAuth);
chatRouter.post('/', aiRateLimiter, validateRequest(chatRequestSchema), streamChat);
chatRouter.get('/history', validateRequest(paginationRequestSchema), listConversationHistory);
chatRouter.delete('/history', clearConversationHistory);
chatRouter.get('/:id/messages', validateRequest(messagesRequestSchema), listMessages);
chatRouter.delete('/:id', validateRequest(resourceIdRequestSchema), deleteConversation);
