# Firebase Authentication Setup

## 1. Create and register the project

1. Create a Firebase project in the Firebase Console.
2. Register a **Web app** and copy its configuration into `frontend/.env` using `frontend/.env.example`.
3. In **Authentication → Sign-in method**, enable **Email/Password** and **Google**.
4. Add each deployed frontend hostname to **Authentication → Settings → Authorized domains**. `localhost` is already appropriate for local development.

## 2. Configure the API

Create a service account for the backend and set its values in `backend/.env`:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Keep the quoted `\n` sequences in `FIREBASE_PRIVATE_KEY`; the server converts them to line breaks at startup. Do not expose this key to the browser or commit it to Git.

## 3. Verify locally

1. Run the API with `npm run dev` from `backend/`.
2. Run the client with `npm run dev` from `frontend/`.
3. Register with email/password or choose Google.
4. On success, Firebase issues an ID token, the client sends it to `POST /api/v1/auth/sync`, and the API creates or updates `users/{uid}` in Firestore.

## Security notes

- The frontend Firebase config identifies a project; it is not an Admin secret. Firebase Authentication, Firestore, and Storage rules still enforce access.
- The API verifies every protected Firebase ID token with Firebase Admin. It does not issue or store a second JWT.
- Phase 5 will add the Firestore rules and user-owned conversation/prompt data model.
