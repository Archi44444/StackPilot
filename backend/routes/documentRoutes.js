import { Router } from 'express';
import { deleteDocument, listDocuments, uploadDocument } from '../controllers/documentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { uploadDocument as upload } from '../middleware/uploadMiddleware.js';
import { paginationRequestSchema, resourceIdRequestSchema } from '../models/schemas.js';

export const documentRouter = Router();

documentRouter.use(requireAuth);
documentRouter.post('/upload', upload.single('file'), uploadDocument);
documentRouter.post('/', upload.single('file'), uploadDocument);
documentRouter.get('/', validateRequest(paginationRequestSchema), listDocuments);
documentRouter.delete('/:id', validateRequest(resourceIdRequestSchema), deleteDocument);
