import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { resourceIdRequestSchema, taskCreateRequestSchema } from '../models/schemas.js';
import { createTask, deleteTask, listTasks } from '../controllers/taskController.js';

export const taskRouter = Router();
taskRouter.use(requireAuth);
taskRouter.post('/', validateRequest(taskCreateRequestSchema), createTask);
taskRouter.get('/', listTasks);
taskRouter.delete('/:id', validateRequest(resourceIdRequestSchema), deleteTask);
