import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebaseAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /api/v1/tasks
 * Logs a completed developer task for the authenticated user.
 */
export const createTask = asyncHandler(async (req, res) => {
  const db = getDb();
  const uid = req.user.uid;
  const body = req.validated.body;

  const doc = await db.collection('tasks').add({
    uid,
    ai_assisted: body.ai_assisted,
    task_difficulty: body.task_difficulty,
    developer_experience: body.developer_experience,
    language: body.language,
    task_type: body.task_type,
    completion_time: body.completion_time,
    createdAt: FieldValue.serverTimestamp(),
  });

  res.status(201).json({ data: { id: doc.id, ...body } });
});

/**
 * GET /api/v1/tasks
 * Lists all tasks logged by the authenticated user, newest first.
 */
export const listTasks = asyncHandler(async (req, res) => {
  const db = getDb();
  const uid = req.user.uid;

  const snapshot = await db.collection('tasks').where('uid', '==', uid).get();
  const tasks = snapshot.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.().toISOString?.() ?? null,
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  res.json({ data: tasks });
});

/**
 * DELETE /api/v1/tasks/:id
 * Deletes a task logged by the authenticated user.
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const db = getDb();
  const uid = req.user.uid;
  const { id } = req.validated.params;

  const ref = db.collection('tasks').doc(id);
  const doc = await ref.get();

  if (!doc.exists || doc.data().uid !== uid) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found.' } });
  }

  await ref.delete();
  res.status(204).send();
});
