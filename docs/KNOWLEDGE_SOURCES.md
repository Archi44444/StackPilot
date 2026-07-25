# Knowledge sources

StackPilot indexes uploads, GitHub repositories, and public documentation pages into one source-aware retrieval flow. Imported repositories are fetched through the GitHub REST API; documentation is extracted through Jina Reader. No provider credentials are exposed to the browser.

## Environment

- `GITHUB_TOKEN` raises GitHub API limits and enables access to repositories readable by that token.
- `JINA_API_KEY` is optional for Jina Reader, but recommended for higher usage limits.
- `GEMINI_API_KEY` enables semantic embeddings. When it is absent or embeddings fail, StackPilot uses a keyword retrieval fallback.

The current vector adapter is deliberately isolated in `backend/rag/vectorStore.js`, so a managed Chroma deployment can replace the in-memory adapter without changing controllers or UI contracts. Sources remain persisted in Firestore; deploy a persistent Chroma adapter before relying on cross-restart semantic retrieval in production.

## API surface

- `POST /api/v1/repositories/import`, `GET /api/v1/repositories`, `DELETE /api/v1/repositories/:id`
- `POST /api/v1/docs/import`, `GET /api/v1/docs`, `DELETE /api/v1/docs/:id`
- `GET /api/v1/stackoverflow/search?q=...`
- `GET /api/v1/dashboard`, `GET /api/v1/analytics`
- `POST /api/v1/upload` or `POST /api/v1/documents/upload`

All endpoints require the existing Firebase Bearer token.
