import { buildInstructions, getAIProvider } from '../services/aiService.js';
import { env } from '../config/env.js';
import { getDb } from '../config/firebaseAdmin.js';
import { createMessage, deleteConversation as deleteConversationRecord, ensureConversation, getRecentMessages, listConversations, listMessages as listMessageRecords } from '../services/firestoreService.js';
import { getDocument, retrieveRelevantChunks } from '../rag/vectorStore.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const writeEvent = (response, event, payload) => response.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);

// Gemini no longer serves this legacy identifier to newly created projects.
// Keep existing saved settings/conversations working while using Google's
// maintained Flash alias for every new request.
const normalizeModel = (model) => model === 'gemini-2.5-flash' ? 'gemini-flash-latest' : model;

async function resolveUserSettings(uid) {
  try {
    const doc = await getDb().collection('users').doc(uid).get();
    return doc.data()?.settings ?? {};
  } catch {
    return {};
  }
}

export const streamChat = asyncHandler(async (request, response) => {
  const { message, conversationId: requestedConversationId, mode, model: requestModel, temperature: requestTemperature, documentId } = request.validated.body;
  const { uid } = request.user;

  // Load user settings for model/temperature defaults, then allow request to override
  const settings = await resolveUserSettings(uid);
  const model = normalizeModel(requestModel || settings.model || (env.ai.provider === 'gemini' ? 'gemini-flash-latest' : (env.ai.openRouterModel || 'openrouter/free')));
  const temperature = requestTemperature ?? settings.temperature ?? 0.3;

  const conversationId = await ensureConversation(uid, requestedConversationId, message);
  await createMessage({ uid, conversationId, role: 'user', content: message });
  const messages = await getRecentMessages(uid, conversationId);
  
  let instructions = buildInstructions(mode);
  let relevantChunks = [];
  if (documentId) {
    const document = await getDocument(uid, documentId);
    if (!document) {
      throw new AppError('The attached document is unavailable. Please upload it again.', { statusCode: 404, code: 'DOCUMENT_NOT_FOUND' });
    }
    // Keep a bounded amount of the exact attachment in the model context. This
    // makes requests such as "explain this document" reliable even when their
    // wording has little overlap with the document text.
    const attachment = document.content.slice(0, 16_000);
    instructions += `\n\nThe user attached the document "${document.filename}". Use the extracted text below to answer their request. Do not say that you cannot access the document. If the answer is not in this text, say so clearly.\n\n--- Attached document text ---\n${attachment}\n--- End attached document text ---`;
  }
  try {
    relevantChunks = await retrieveRelevantChunks(uid, message);
    if (relevantChunks && relevantChunks.length > 0) {
      instructions += '\n\nGrounding context. Cite the source title when you use it:\n' + relevantChunks.map(({ content, source }) => `- [${source.title}] ${content}`).join('\n');
    }
  } catch (err) {
    logger.error('Error retrieving chunks', { error: err.message });
  }

  // Express 5 removed flushHeaders(); manually write status and headers
  response.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let assistantContent = '';
  try {
    const ai = getAIProvider(model);
    for await (const token of ai.streamChat(messages, { instructions, model, temperature })) {
      assistantContent += token;
      writeEvent(response, 'token', { content: token });
    }
    const messageId = await createMessage({
      uid,
      conversationId,
      role: 'assistant',
      content: assistantContent,
      model,
    });
    writeEvent(response, 'sources', { sources: [...new Map((relevantChunks || []).map(({ source }) => [source.id, source])).values()] });
    writeEvent(response, 'done', { conversationId, messageId });
  } catch (error) {
    logger.error('AI streaming failed', { requestId: request.id, uid, conversationId, error: error.message, stack: error.stack });
    // Propagate meaningful error messages to the frontend
    const errorCode = error.code ?? 'AI_UNAVAILABLE';
    const errorMessage = error.statusCode && error.statusCode < 500 
      ? error.message 
      : 'Unable to complete this response. Please check your API key configuration and try again.';
    writeEvent(response, 'error', { code: errorCode, message: errorMessage, details: error.details });
  } finally {
    response.end();
  }
});
export const listConversationHistory = asyncHandler(async (request, response) => {
  response.status(200).json({ data: await listConversations(request.user.uid, request.validated.query) });
});
export const listMessages = asyncHandler(async (request, response) => {
  response.status(200).json({ data: await listMessageRecords(request.user.uid, request.validated.params.id, request.validated.query) });
});
export const deleteConversation = asyncHandler(async (request, response) => {
  await deleteConversationRecord(request.user.uid, request.validated.params.id);
  response.status(204).send();
});
