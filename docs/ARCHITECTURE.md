# Architecture

## Goals and boundaries

StackPilot is a multi-tenant developer assistant. Firebase Authentication is the only identity authority: the browser obtains an ID token, and the API verifies it with Firebase Admin before any protected work. The backend is the only place that reads AI-provider secrets, creates embeddings, or accesses ChromaDB.

The client can write user-owned Firestore data only through narrowly scoped security rules. Operations that combine systems—document ingestion, streamed AI responses, account deletion—are API responsibilities.

## System context

```text
React client ── Firebase Auth ──► Firebase
     │            Firestore / Storage ▲
     │ ID token                        │
     ▼                                 │
Express API ── Firebase Admin ─────────┘
     │
     ├── AIProvider adapter ──► OpenAI (initial provider)
     └── RAG pipeline ──► ChromaDB + Hugging Face embeddings
```

## Repository structure

```text
frontend/src/
  assets/        Static application assets
  components/    Reusable UI, grouped by domain
  context/       Application-wide state providers
  firebase/      Web SDK initialization and client helpers
  hooks/         Reusable client-side behavior
  layouts/       Page shells
  pages/         Route-level composition only
  services/      HTTP client and endpoint wrappers
  styles/        Global tokens and base styles
  utils/         Pure helpers and animation presets

backend/
  config/        Environment-backed infrastructure clients
  controllers/   HTTP orchestration only
  middleware/    Authentication, validation, limits, errors
  models/        Zod schemas and data contracts
  rag/           Load, chunk, embed, store, and retrieve
  routes/        Endpoint declarations and middleware order
  services/      Business capabilities and external adapters
    providers/   Implementations of the AI provider contract
  utils/         Logging, errors, async wrappers, constants
  tests/         Unit and integration tests
  uploads/       Ignored transient upload workspace
```

## Layering rules

- A route selects middleware and calls one controller; it contains no business logic.
- A controller validates the endpoint workflow and delegates to a service.
- Services do not depend on Express `req` or `res` objects.
- Configuration modules construct infrastructure clients once and export them.
- RAG modules are composable, deterministic units; `ragService` orchestrates them.
- Client pages compose layouts and domain components. Networking lives in `services`, not components.

## Identity and authorization flow

1. Firebase Web SDK signs in the user.
2. Axios adds a freshly retrieved Firebase ID token as `Authorization: Bearer <token>`.
3. `authMiddleware` verifies it with Firebase Admin and assigns `req.user = { uid, email }`.
4. Every service receives `uid` explicitly and scopes Firestore, Storage, and vector queries to it.

Do not add a second custom JWT. Firebase ID tokens already provide signed identity, expiry, and revocation support.

## AI provider boundary

`AIProvider` exposes `streamChat(messages, options)` and, only where needed, capability-specific methods. `OpenAIProvider`, `GeminiProvider`, and `OpenRouterProvider` implement the same streaming shape. Controllers and RAG code use the interface, never provider SDKs directly. Embeddings are deliberately a separate RAG concern because their model and lifecycle differ from chat completion.

## Document/RAG lifecycle

1. API authenticates and validates PDF, Markdown, or TXT upload.
2. Storage service writes to `users/{uid}/documents/{documentId}/source`.
3. A Firestore document begins as `processing`.
4. Loader extracts text, chunker assigns stable chunk IDs, embedder creates vectors, and vector store persists them under a user-and-document-scoped collection/metadata filter.
5. Status becomes `ready`, or `error` with an internal logged cause.
6. Document questions retrieve only matching `uid` and optional `documentId` chunks. If similarity thresholds produce no context, the model is not called with a fabricated context; the API returns an explicit unavailable answer.

## Data model and indexes

Top-level Firestore collections remain intentionally queryable by the API while all records carry `uid`:

| Collection | Required fields | Primary queries |
| --- | --- | --- |
| `users/{uid}` | profile, settings, createdAt | direct UID lookup |
| `conversations/{id}` | uid, title, createdAt, updatedAt, messageCount | uid + updatedAt desc |
| `messages/{id}` | uid, conversationId, role, content, createdAt | uid + conversationId + createdAt asc |
| `documents/{id}` | uid, name, type, size, storagePath, vectorNamespace, status, uploadedAt | uid + uploadedAt desc |
| `prompts/{id}` | uid, title, content, category, createdAt, updatedAt | uid + updatedAt desc |

Messages are separate from conversations to keep each document bounded in size. All stored timestamps are server timestamps. `storagePath`, rather than a long-lived download URL, is canonical; URLs are generated when required.

## Error and streaming contract

JSON endpoints use `{ "data": ... }` on success and `{ "error": { "code", "message", "requestId" } }` on failure. SSE chat returns `event: token`, `event: done`, and `event: error`; each event contains JSON. The server persists a completed assistant message only after the stream finishes successfully.

## Security baseline

- Helmet, CORS allowlist, request IDs, structured logs, and global error handling start in Phase 2.
- Zod validates body, params, and query inputs at the route edge.
- File uploads have both allowlisted extension/mime checks and byte limits; filenames are never trusted.
- Firestore and Storage rules enforce `request.auth.uid` ownership independently of the API.
- Vector metadata always includes `uid`; retrieval must filter by it.
- Logs never contain bearer tokens, provider keys, raw passwords, or full private document contents.
