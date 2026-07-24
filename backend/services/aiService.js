import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { OpenRouterProvider } from './providers/OpenRouterProvider.js';

let geminiProvider;
let openRouterProvider;

/**
 * Returns an AI provider matching the given model name.
 * Models starting with "gemini" use the Gemini provider;
 * everything else (openrouter/*, openai/*, anthropic/*, etc.) uses OpenRouter.
 */
export function getAIProvider(model) {
  const modelName = (model || env.ai.openRouterModel || 'gemini-flash-latest').toLowerCase();
  const useGemini = modelName.startsWith('gemini');

  if (useGemini) {
    if (!geminiProvider) {
      geminiProvider = new GeminiProvider();
    }
    return geminiProvider;
  }

  if (!openRouterProvider) {
    openRouterProvider = new OpenRouterProvider();
  }
  return openRouterProvider;
}

const modeInstructions = {
  chat: 'Answer as a precise, practical senior software engineer.',
  debug: 'Diagnose the error, explain the likely root cause, and propose a corrected solution.',
  explain: 'Explain the supplied code clearly, including important trade-offs and complexity where useful.',
  improve: 'Suggest and provide a safer, clearer, more maintainable implementation.',
  optimize: 'Identify measurable bottlenecks before proposing performance changes.',
  refactor: 'Preserve behavior while improving structure, naming, and testability.',
  convert: 'Convert the requested code carefully and call out semantic differences.',
  test: 'Create targeted tests that cover expected behavior and meaningful edge cases.',
  document: 'Write accurate technical documentation from the supplied context.',
};

export function buildInstructions(mode) {
  return `${modeInstructions[mode] ?? modeInstructions.chat} Return well-structured Markdown. Put code in fenced blocks with a language tag when known. Do not claim you ran code, accessed files, or verified facts you were not given.`;
}
