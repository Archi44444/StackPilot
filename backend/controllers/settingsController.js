import { getDb } from '../config/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { z } from 'zod';

const updateSchema = z.object({
  theme: z.enum(['dark', 'light']).optional(),
  model: z.string().min(1).max(128).optional(),
  temperature: z.number().min(0).max(2).optional(),
}).refine(data => Object.keys(data).length > 0, 'At least one field required');

export const getSettings = asyncHandler(async (request, response) => {
  const doc = await getDb().collection('users').doc(request.user.uid).get();
  const settings = doc.data()?.settings ?? { theme: 'dark', model: 'gemini-flash-latest', temperature: 0.3 };
  response.status(200).json({ data: settings });
});

export const updateSettings = asyncHandler(async (request, response) => {
  const parsed = updateSchema.safeParse(request.body);
  if (!parsed.success) {
    throw new AppError('Invalid settings', { statusCode: 400, code: 'VALIDATION_ERROR', details: parsed.error.flatten() });
  }
  await getDb().collection('users').doc(request.user.uid).set({
    settings: parsed.data,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  const doc = await getDb().collection('users').doc(request.user.uid).get();
  response.status(200).json({ data: doc.data()?.settings ?? parsed.data });
});
