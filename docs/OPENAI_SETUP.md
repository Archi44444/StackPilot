# OpenAI Chat Setup

## Configure the server

Add the key only to `backend/.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
```

Do not add `OPENAI_API_KEY` to `frontend/.env`, commit it to the repository, or return it from an API endpoint. The browser receives only the application’s authenticated SSE stream.

## Request flow

1. The signed-in browser sends `POST /api/v1/chat` with its Firebase ID token.
2. The API verifies the token, stores the user message, and loads the recent conversation context.
3. The provider adapter streams OpenAI Responses API output.
4. The API forwards `token`, `done`, and `error` SSE events to the browser.
5. After a successful stream, the assistant response is stored in Firestore and immediately appears through the real-time listener.

The default `gpt-4o-mini` value is an application setting; change `OPENAI_MODEL` in the server environment to use another model available to your OpenAI project. The provider boundary in `backend/services/aiService.js` keeps future Gemini/OpenRouter adapters isolated from controllers and UI.

## Verify locally

1. Ensure Firebase Authentication and Firestore are configured.
2. Add the server key above and run `npm run dev` from `backend/`.
3. Run `npm run dev` from `frontend/`, sign in, then open a new chat.
4. Send a prompt and confirm that tokens stream into the chat window and the conversation appears in the sidebar.

The implementation follows OpenAI’s server-side JavaScript SDK and Responses API streaming pattern. See the [official API quickstart](https://platform.openai.com/docs/quickstart/make-your-first-api-request) for key creation and SDK guidance.
