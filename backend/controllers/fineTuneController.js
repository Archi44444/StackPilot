import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { retrieveRelevantChunks } from '../rag/vectorStore.js';
import { ensureConversation, createMessage } from '../services/firestoreService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INFER_SCRIPT = path.resolve(__dirname, '../../ml/infer.py');
const MODEL_NAME = 'Qwen2.5-0.5B (Fine-tuned / Local)';

/**
 * Runs ml/infer.py as a subprocess with the given question and context.
 * Returns the generated answer string, or throws on failure.
 */
function runLocalInference(question, context) {
  return new Promise((resolve, reject) => {
    const args = [
      INFER_SCRIPT,
      '--question', question,
      '--context', context || '',
    ];

    logger.info('Spawning local Python inference subprocess', { script: INFER_SCRIPT });

    const proc = spawn('python', args, { env: { ...process.env } });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      if (code !== 0) {
        logger.error('Python inference subprocess exited with non-zero code', { code, stderr });
        return reject(new AppError(
          `Local inference process failed (exit code ${code}). Make sure Python, PyTorch, and Transformers are installed.\n${stderr}`,
          { statusCode: 500, code: 'INFERENCE_SUBPROCESS_ERROR' }
        ));
      }

      // Subprocess prints one JSON line to stdout: {"answer": "..."} or {"error": "..."}
      const lastLine = stdout.trim().split('\n').filter(l => l.startsWith('{')).pop();
      if (!lastLine) {
        logger.error('No JSON output from inference subprocess', { stdout, stderr });
        return reject(new AppError('Inference subprocess produced no output.', { statusCode: 500, code: 'INFERENCE_NO_OUTPUT' }));
      }

      try {
        const parsed = JSON.parse(lastLine);
        if (parsed.error) {
          return reject(new AppError(`Inference error: ${parsed.error}`, { statusCode: 500, code: 'INFERENCE_PYTHON_ERROR' }));
        }
        resolve(parsed.answer || '');
      } catch (e) {
        logger.error('Failed to parse inference subprocess JSON', { lastLine, parseError: e.message });
        reject(new AppError('Failed to parse inference subprocess output.', { statusCode: 500, code: 'INFERENCE_PARSE_ERROR' }));
      }
    });

    proc.on('error', (err) => {
      logger.error('Failed to spawn Python subprocess', { error: err.message });
      reject(new AppError(
        `Could not start inference subprocess. Is Python installed and in PATH? Error: ${err.message}`,
        { statusCode: 500, code: 'INFERENCE_SPAWN_ERROR' }
      ));
    });
  });
}

export const generateFineTuned = asyncHandler(async (request, response) => {
  const { message, conversationId: requestedConversationId } = request.validated.body;
  const { uid } = request.user;

  // 1. Ensure conversation and save user message
  const conversationId = await ensureConversation(uid, requestedConversationId, message);
  await createMessage({ uid, conversationId, role: 'user', content: message });

  // 2. Retrieve Grounding Context from RAG
  let relevantChunks = [];
  try {
    relevantChunks = await retrieveRelevantChunks(uid, message, 4, conversationId);
  } catch (err) {
    logger.error('RAG retrieval failed during fine-tune inference', { error: err.message });
  }

  const contextText = relevantChunks.length > 0
    ? relevantChunks.map(({ content, source }) => `- [${source.title}] ${content}`).join('\n')
    : '';

  // 3. Run inference — HF Space in production, local subprocess in development
  let answer;

  const hfSpaceUrl = (process.env.HF_SPACE_URL || '').trim();

  if (process.env.NODE_ENV === 'production' && !hfSpaceUrl) {
    // No inference server configured for production — return informative response.
    // To enable production inference, deploy ml/space/ to any Python host and set HF_SPACE_URL.
    logger.info('Fine-tune inference requested in production without HF_SPACE_URL — returning info notice.');
    return response.status(200).json({
      data: {
        conversationId: requestedConversationId || 'demo',
        answer:
          '🤖 **Qwen2.5-0.5B (Fine-tuned) — Local Demo Feature**\n\n' +
          'This model was fine-tuned locally using **LoRA/PEFT** on developer Q&A data and runs via a Python subprocess. ' +
          'Local inference is fully working — the model correctly answers developer questions with RAG-grounded context.\n\n' +
          '**To test it:** Run the project locally and select this model in the dropdown.',
        sources: [],
        model: MODEL_NAME,
      },
    });
  }

  if (hfSpaceUrl) {
    // ── Optional: call external inference server if HF_SPACE_URL is set ─────
    logger.info('Calling HF Space inference API', { url: hfSpaceUrl });

    const spaceResponse = await fetch(`${hfSpaceUrl}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Gradio REST API format: {"data": [input1, input2, ...]}
      body: JSON.stringify({ data: [message, contextText] }),
      signal: AbortSignal.timeout(120_000), // 2 min timeout for cold starts
    });

    if (!spaceResponse.ok) {
      const errText = await spaceResponse.text();
      if (spaceResponse.status === 503) {
        throw new AppError(
          'The inference server is warming up. Please try again in ~30 seconds.',
          { statusCode: 503, code: 'SPACE_LOADING' }
        );
      }
      throw new AppError(
        `Inference API error (${spaceResponse.status}): ${errText}`,
        { statusCode: spaceResponse.status, code: 'SPACE_API_ERROR' }
      );
    }

    // Gradio response format: {"data": ["answer text"], "duration": ...}
    const data = await spaceResponse.json();
    answer = (data.data && data.data[0]) || '';
  } else {
    // ── Local: spawn Python subprocess (development / local demo) ────────────
    answer = await runLocalInference(message, contextText);
  }

  // 4. Save assistant message to Firestore
  await createMessage({
    uid,
    conversationId,
    role: 'assistant',
    content: answer,
    model: MODEL_NAME,
  });

  const sources = [...new Map((relevantChunks || []).map(({ source }) => [source.id, source])).values()];

  response.status(200).json({
    data: {
      conversationId,
      answer,
      sources,
      model: MODEL_NAME,
    },
  });
});
