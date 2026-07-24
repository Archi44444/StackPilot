# API Contract

Base URL: `/api/v1` in production; the local server may mount it at the same prefix. Every endpoint other than health requires `Authorization: Bearer <Firebase ID token>`.

## Conventions

- Responses are JSON except `POST /chat`, which uses Server-Sent Events.
- The API accepts and returns ISO-8601 timestamps.
- IDs are opaque strings generated server-side.
- Mutation endpoints require the authenticated owner; a resource that is missing or belongs to another user returns `404`.

## Health

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness check; no authentication |

## Auth

Client Firebase SDK owns registration, email/password sign-in, Google sign-in, and logout. The backend never accepts passwords or Google credentials.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/sync` | Create/update the caller profile after Firebase sign-in |
| GET | `/auth/me` | Read caller profile and preferences |
| DELETE | `/auth/account` | Delete caller data and Firebase account |

## Chat

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/chat` | SSE assistant response and conversation persistence |
| GET | `/chat/history` | Paginated conversations for caller |
| GET | `/chat/:id/messages` | Paginated messages for a caller-owned conversation |
| DELETE | `/chat/:id` | Delete conversation and messages |

`POST /chat` body:

```json
{
  "conversationId": "optional-existing-id",
  "message": "Explain this error",
  "mode": "chat",
  "documentId": "optional-ready-document-id",
  "model": "optional-user-selected-model",
  "temperature": 0.3
}
```

`mode` is an allowlisted feature enum, initially `chat`, `debug`, `explain`, `improve`, `optimize`, `refactor`, `convert`, `test`, and `document`. Document-grounded mode requires a ready, caller-owned document.

SSE event payloads:

```text
event: token
data: {"content":"partial text"}

event: done
data: {"conversationId":"...","messageId":"...","usage":{"inputTokens":0,"outputTokens":0}}

event: error
data: {"code":"AI_UNAVAILABLE","message":"Unable to complete this response."}
```

## Documents

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/documents/upload` | Accept one multipart `file`, queue/process ingestion |
| GET | `/documents` | List caller documents |
| DELETE | `/documents/:id` | Remove source, vectors, and metadata |

Allowed source types are PDF, Markdown (`.md`), and plain text (`.txt`). The limit is environment-configured, defaulting to 20 MB. Upload response is `202 Accepted` with `{ "data": { "documentId", "status": "processing" } }`.

## Prompts

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/prompts` | Create a caller-owned prompt |
| GET | `/prompts` | List prompts |
| PUT | `/prompts/:id` | Update allowed fields |
| DELETE | `/prompts/:id` | Delete prompt |

Create payload: `{ "title": "React code review", "content": "...", "category": "review" }`.
