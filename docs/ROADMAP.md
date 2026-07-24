# Incremental Delivery Roadmap

## Phase 1 — Architecture and design system

Completed: repository boundaries, data model, API contract, security plan, environment templates, and visual token foundation.

## Phase 2 — Backend foundation

Create the Express app, config validation, Firebase Admin initialization, request logging, Helmet, CORS, rate limits, global errors, authentication middleware, Zod schemas, and route/controller skeletons. Add tests for the health endpoint and token guard.

## Phase 3 — Frontend foundation

Completed: Vite and Tailwind, responsive Fluence layouts, shared UI primitives, landing/auth shells, protected-route boundary, and token-ready Axios client interceptor.

## Phase 4 — Firebase identity

Completed: email/password registration and sign-in, Google sign-in, logout, Firebase session provider, ID-token API propagation, `/auth/sync`, Firestore user-profile initialization, and user-facing errors.

## Phase 5 — Firestore persistence

Completed: secured Firestore prompt CRUD, conversation/message history APIs, real-time conversation/message/prompt listeners, composite indexes, user-scoped rules, and prompt-library loading/empty/error states.

## Phase 6 — AI chat

Completed: provider adapter, OpenAI Responses API streaming implementation, authenticated SSE endpoint, Firestore conversation/message lifecycle, lazy-loaded Markdown/code rendering, copyable highlighted code blocks, and live streamed-response UI. Usage capture remains available for a later analytics pass.

## Phase 7 — RAG

Build document validation, extraction, chunking, embedding, ChromaDB storage, status lifecycle, retrieval filtering, grounded-answer prompt, and deletion cleanup.

## Phase 8–10 — Product completion

Deliver dashboard metrics, code tools, settings, exports, deployment manifests, CI checks, accessibility/performance review, screenshots, and end-user documentation.
