import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { importDocumentationRequestSchema, importRepositoryRequestSchema, resourceIdRequestSchema, stackOverflowSearchRequestSchema } from '../models/schemas.js';
import { dashboard, deleteDocs, deleteRepo, importDocs, importRepo, listDocs, listRepos, stackOverflow } from '../controllers/knowledgeController.js';
import { getAnalyticsCausal } from '../controllers/causalController.js';

export const knowledgeRouter = Router();
knowledgeRouter.use(requireAuth);
knowledgeRouter.post('/repositories/import', validateRequest(importRepositoryRequestSchema), importRepo);
knowledgeRouter.get('/repositories', listRepos);
knowledgeRouter.delete('/repositories/:id', validateRequest(resourceIdRequestSchema), deleteRepo);
knowledgeRouter.post('/docs/import', validateRequest(importDocumentationRequestSchema), importDocs);
knowledgeRouter.get('/docs', listDocs);
knowledgeRouter.delete('/docs/:id', validateRequest(resourceIdRequestSchema), deleteDocs);
knowledgeRouter.get('/stackoverflow/search', validateRequest(stackOverflowSearchRequestSchema), stackOverflow);
knowledgeRouter.get('/dashboard', dashboard);
knowledgeRouter.get('/analytics', dashboard);
knowledgeRouter.get('/analytics/causal', getAnalyticsCausal);
