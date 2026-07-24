import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';

export class OpenRouterProvider {
  constructor() {
    if (!env.ai.openRouterApiKey) {
      throw new AppError('The OpenRouter provider is not configured.', { statusCode: 503, code: 'AI_NOT_CONFIGURED' });
    }
  }

  async *streamChat(messages, { instructions, model = env.ai.openRouterModel || 'openrouter/free', temperature = 0.3, signal } = {}) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.ai.openRouterApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: instructions },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        temperature,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      throw new AppError(`OpenRouter request failed with status ${response.status}`, { statusCode: 502, code: 'AI_PROVIDER_ERROR' });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep the incomplete line in the buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
            const dataStr = trimmed.slice(6);
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                yield delta;
              }
            } catch (err) {
              // ignore parse errors for partial chunks or non-json data
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
