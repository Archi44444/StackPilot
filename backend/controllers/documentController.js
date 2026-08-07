import { parseDocument } from '../rag/documentParser.js';
import { addDocument, listDocuments as listDocs, deleteDocument as deleteDoc } from '../rag/vectorStore.js';
import { FieldValue } from 'firebase-admin/firestore';
import { getDb } from '../config/firebaseAdmin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import fs from 'fs/promises';

export const uploadDocument = asyncHandler(async (request, response) => {
  if (!request.file) {
    throw new AppError('No file uploaded.', { statusCode: 400, code: 'FILE_MISSING' });
  }
  
  try {
    const text = await parseDocument(request.file.path, request.file.originalname);
    const doc = await addDocument(request.user.uid, request.file.originalname, text);
    
    // Clean up temporary file
    await fs.unlink(request.file.path).catch(console.error);
    await getDb().collection('activity').add({ uid: request.user.uid, type: 'document_uploaded', title: `Uploaded ${request.file.originalname}`, createdAt: FieldValue.serverTimestamp() });
    
    response.status(201).json({ data: doc });
  } catch (err) {
    // Clean up temporary file on error
    await fs.unlink(request.file.path).catch(console.error);
    throw new AppError(`Error processing document: ${err.message}`, { statusCode: 500, code: 'DOCUMENT_PROCESSING_FAILED' });
  }
});

export const listDocuments = asyncHandler(async (request, response) => {
  const docs = await listDocs(request.user.uid);
  response.status(200).json({ data: docs });
});

export const deleteDocument = asyncHandler(async (request, response) => {
  await deleteDoc(request.user.uid, request.validated.params.id);
  await getDb().collection('activity').add({ uid: request.user.uid, type: 'document_deleted', title: `Deleted document ${request.validated.params.id}`, createdAt: FieldValue.serverTimestamp() });
  response.status(204).send();
});
