# Firestore Setup

## Deploy access controls and indexes

The repository includes [firestore.rules](../firestore.rules) and [firestore.indexes.json](../firestore.indexes.json). Deploy them with the Firebase CLI after selecting the correct project:

```powershell
firebase deploy --only firestore:rules,firestore:indexes
```

The rules scope every user-owned top-level resource (`conversations`, `messages`, `prompts`, and `documents`) to its `uid`. The client’s real-time queries always include that `uid` filter, which is required for Firestore Rules to approve collection queries.

## Required indexes

The supplied index configuration creates these composite indexes:

- `conversations`: `uid`, then `updatedAt` descending
- `messages`: `uid`, `conversationId`, then `createdAt` ascending
- `prompts`: `uid`, then `updatedAt` descending

Index construction can take a few minutes after the first deployment. Until complete, Firestore returns an error containing a Console link for the requested index.

## Data ownership

- The backend uses Firebase Admin and writes the authenticated user’s `uid` into every record.
- The browser receives real-time snapshots only for its own `uid`.
- Prompt mutations use the protected backend API; the Firestore listener immediately reflects the resulting write.
- Chat generation will create conversation/message records in Phase 6; the Phase 5 history APIs and listeners are already prepared to read and delete them.
