import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebaseAdmin.js';
import { createPrompt as createPromptRecord, deletePrompt as deletePromptRecord, listPrompts as listPromptRecords, updatePrompt as updatePromptRecord } from '../services/firestoreService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createPrompt = asyncHandler(async (request, response) => {
  const prompt = await createPromptRecord(request.user.uid, request.validated.body);
  await getDb().collection('activity').add({ uid: request.user.uid, type: 'prompt_created', title: `Created prompt ${prompt.title}`, createdAt: FieldValue.serverTimestamp() });
  response.status(201).json({ data: prompt });
});
export const listPrompts = asyncHandler(async (request, response) => {
  response.status(200).json({ data: await listPromptRecords(request.user.uid, request.validated.query) });
});
export const updatePrompt = asyncHandler(async (request, response) => {
  const prompt = await updatePromptRecord(request.user.uid, request.validated.params.id, request.validated.body);
  response.status(200).json({ data: prompt });
});
export const deletePrompt = asyncHandler(async (request, response) => {
  await getDb().collection('activity').add({ uid: request.user.uid, type: 'prompt_deleted', title: `Deleted prompt ${request.validated.params.id}`, createdAt: FieldValue.serverTimestamp() });
  await deletePromptRecord(request.user.uid, request.validated.params.id);
  response.status(204).send();
});
