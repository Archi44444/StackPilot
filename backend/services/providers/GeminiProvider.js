import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { logger } from '../../utils/logger.js';

export class GeminiProvider {
  #client;

  constructor() {
    if (!env.ai.geminiApiKey) {
      throw new AppError('The Gemini provider is not configured.', { statusCode: 503, code: 'AI_NOT_CONFIGURED' });
    }
    try {
      this.#client = new GoogleGenAI({ apiKey: env.ai.geminiApiKey });
    } catch (error) {
      logger.error('Failed to initialize Gemini client', { error: error.message, stack: error.stack });
      throw new AppError('Failed to initialize Gemini provider. Please check your API key configuration.', {
        statusCode: 503,
        code: 'AI_INIT_FAILED',
        details: { message: error.message }
      });
    }
  }

  async *streamChat(messages, { instructions, model = 'gemini-flash-latest', temperature = 0.3, signal } = {}) {
    if (!this.#client) {
      throw new AppError('Gemini client is not initialized.', { statusCode: 503, code: 'AI_NOT_READY' });
    }

    const formattedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    let responseStream;
    try {
      responseStream = await this.#client.models.generateContentStream({
        model,
        contents: formattedMessages,
        config: {
          systemInstruction: instructions,
          temperature,
        }
      });
    } catch (error) {
      logger.error('Gemini generateContentStream failed', { error: error.message, model });
      // Handle API key format rejection gracefully
      if (error.message && (error.message.includes('API_KEY') || error.message.includes('apiKey') || error.message.includes('API key not valid') || error.message.includes('API key'))) {
        throw new AppError('Your Gemini API key appears to be invalid or in an unsupported format. Please check your API key configuration.', {
          statusCode: 503,
          code: 'AI_KEY_INVALID',
          details: { message: 'The API key format was rejected by the Gemini service. Ensure you are using a valid Gemini API key.' }
        });
      }
      throw new AppError('Failed to connect to Gemini. The service may be temporarily unavailable.', {
        statusCode: 503,
        code: 'AI_SERVICE_UNAVAILABLE',
        details: { message: error.message }
      });
    }

    try {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      logger.error('Gemini stream iteration failed', { error: error.message });
      throw new AppError('Stream interrupted while reading from Gemini.', {
        statusCode: 503,
        code: 'AI_STREAM_ERROR',
        details: { message: error.message }
      });
    }
  }
}
