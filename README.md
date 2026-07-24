# StackPilot

StackPilot is a web application for authenticated, AI-assisted developer conversations. It pairs a React client with an Express API, Firebase Authentication/Firestore, and either Gemini or OpenRouter for streamed responses.

## What is implemented

- Email/password and Google sign-in through Firebase Authentication.
- Streaming chat responses over Server-Sent Events (SSE).
- Conversation and message history stored in Firestore for the signed-in user.
- Chat modes for tasks such as debugging, explaining, refactoring, and testing.
- Saved prompts and per-user chat settings.
- PDF, DOCX, Markdown, and text uploads. Extracted text can be included as chat context.
- Gemini embeddings when available, with a keyword-search fallback.
- Request validation, CORS allowlisting, Helmet, and API rate limiting.

## Important limitations

- Uploaded documents and their search index are held **in server memory**. They are removed when the API process restarts and are not stored in Firebase or ChromaDB.
- Document upload files are temporary: the source file is deleted after text extraction.
- Firebase is required for authenticated API routes and Firestore-backed conversations, prompts, and settings.
- The application has not been presented here as deployed or production-ready; configure, test, and secure it for your own environment before deployment.

## Stack

| Area | Technology |
| --- | --- |
| Client | React, Vite, Tailwind CSS, Firebase Web SDK |
| API | Node.js 20+, Express |
| Authentication & data | Firebase Authentication, Firebase Admin, Firestore |
| AI providers | Google Gemini or OpenRouter |
| Documents | `pdf-parse`, Mammoth, in-memory search index |

## Run locally

### Prerequisites

- Node.js 20.11 or later
- A Firebase project with Email/Password authentication enabled; enable Google too if you want the Google sign-in option
- A Firebase service-account credential for the API
- A Gemini API key or an OpenRouter API key

### 1. Configure Firebase

1. Register a web app in Firebase and enable the desired sign-in providers.
2. Create a service account for the backend.
3. Add `localhost` (and any deployed client domain) to Firebase Authentication's authorized domains.

See [docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md) for the values required by the client and API.

### 2. Start the API

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

On Windows PowerShell, copy the example file with:

```powershell
Copy-Item .env.example .env
```

Set the Firebase Admin values in `backend/.env`. Then select one provider:

```env
# Gemini
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key

# or OpenRouter
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=your_model_identifier
```

The API listens on `http://localhost:5000` by default. Its health check is available at `GET /health`.

### 3. Start the client

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Set the `VITE_FIREBASE_*` values in `frontend/.env` to your Firebase web-app configuration. `VITE_BACKEND_URL` defaults to `http://localhost:5000/api/v1`, which matches the local API.

## Environment notes

- Do not commit `.env` files or Firebase service-account keys.
- `CORS_ORIGIN` must include the client origin; locally it defaults to `http://localhost:5173`.
- The API accepts `pdf,md,txt` by default. To accept DOCX uploads, set `ALLOWED_FILE_TYPES=pdf,md,txt,docx` in `backend/.env`.
- The default upload limit is 20 MB and can be changed with `MAX_FILE_SIZE_MB`.

## Available scripts

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | Start the API with Node's watch mode |
| `backend` | `npm start` | Start the API |
| `backend` | `npm test` | Run Node's test suite |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Create a production client build |
| `frontend` | `npm run preview` | Preview a built client |

## Project layout

```text
backend/   Express API, Firebase Admin integration, AI providers, document parsing
frontend/  React application and Firebase client integration
docs/      API, architecture, Firebase, Firestore, and design notes
```

## License

No license file is included in this repository. All rights are reserved unless the repository owner adds a license.
