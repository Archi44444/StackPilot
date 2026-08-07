# 🚀 StackPilot
### AI-Powered Developer Copilot with Retrieval-Augmented Generation (RAG)

StackPilot is a full-stack AI developer assistant that enables developers to chat with GitHub repositories, technical documentation, PDFs, Markdown files, and codebases using Retrieval-Augmented Generation (RAG).

The platform combines semantic search, vector embeddings, repository indexing, documentation ingestion, and LLM-powered reasoning to provide accurate, context-aware coding assistance with verifiable source citations.

---

# 🌐 Live Demo

Try StackPilot at: https://stack-pilot-jet.vercel.app

---

# 🚀 Core Objectives

- Chat with GitHub repositories using AI
- Import and index technical documentation
- Upload PDFs and Markdown files for semantic search
- Build a unified developer knowledge base
- Provide source-cited AI responses
- Reduce developer context switching
- Improve onboarding for unfamiliar codebases
- Deliver context-aware coding assistance

---

# 🏗️ System Architecture

```
React + Vite + Tailwind
          │
          ▼
Firebase Authentication
          │
          ▼
Node.js + Express Backend
          │
          ├── LangChain.js
          ├── Gemini API
          ├── OpenRouter API
          ├── GitHub REST API
          ├── Jina AI Reader
          ├── ChromaDB
          └── Firestore
```

---

# 🖥️ Frontend

Located in

```
frontend/
```

## Tech Stack

- React.js
- Vite
- Tailwind CSS
- Framer Motion
- Firebase Authentication
- React Router
- Axios

---

# ✨ Features

## AI Chat

Developers can ask

- Explain this project
- Explain this function
- Find where authentication is implemented
- Summarize this repository
- Explain folder structure
- Generate onboarding guide
- Explain dependencies
- Suggest improvements

---

## GitHub Repository Import

Supports

- Public repositories
- README extraction
- Folder structure analysis
- Documentation indexing
- Semantic repository search

---

## Documentation Import

Import documentation websites including

- React
- Next.js
- Express
- Node.js
- Tailwind CSS
- Firebase
- FastAPI
- LangChain
- Python Docs
- Any developer documentation

---

## PDF Knowledge Base

Upload

- Technical books
- Research papers
- API documentation
- User manuals
- Notes

Search using semantic retrieval.

---

## Prompt Library

Users can

- Save prompts
- Edit prompts
- Delete prompts
- Organize reusable developer prompts

---

## Conversation History

Store

- Previous chats
- AI responses
- Source citations
- Repository-specific conversations

---

# 👨‍💻 Developer Workflow

```
Login
    │
    ▼
Dashboard
    │
    ▼
Import Repository
    │
    ▼
Index Documentation
    │
    ▼
Generate Embeddings
    │
    ▼
Store in ChromaDB
    │
    ▼
Chat with AI
    │
    ▼
Receive Source-Cited Response
```

---

# ⚙️ Backend

Located in

```
backend/
```

---

# 🔹 Core Components

## 1️⃣ GitHub Service

Responsible for

- Repository import
- README extraction
- File tree retrieval
- Repository metadata
- Code indexing

Uses

- GitHub REST API

---

## 2️⃣ Documentation Service

Responsible for

- Documentation crawling
- Content extraction
- Text preprocessing

Uses

- Jina AI Reader API

---

## 3️⃣ RAG Pipeline

Workflow

```
User Query
      │
      ▼
Vector Search
      │
      ▼
Relevant Context Retrieval
      │
      ▼
Prompt Construction
      │
      ▼
Gemini / OpenRouter
      │
      ▼
Grounded AI Response
```

---

## 4️⃣ Vector Database

Uses ChromaDB for

- Semantic search
- Embedding storage
- Similarity search
- Context retrieval

---

## 5️⃣ AI Service

Supports

- Gemini API
- OpenRouter Models

Handles

- Prompt engineering
- Context injection
- Response formatting
- Source citation generation

---

## 6️⃣ Authentication

Managed using Firebase Authentication.

Supports

- Google Sign-In
- Secure token verification
- Protected API routes

---

# 🔐 Authentication Flow

```
User Login
      │
      ▼
Firebase Authentication
      │
      ▼
JWT Verification
      │
      ▼
Express Middleware
      │
      ▼
Protected APIs
```

---

# 🧠 RAG Workflow

```
Repository
Documentation
PDF
Markdown
        │
        ▼
Chunking
        │
        ▼
Embedding Generation
        │
        ▼
ChromaDB
        │
        ▼
Semantic Retrieval
        │
        ▼
Gemini / OpenRouter
        │
        ▼
Grounded AI Response
```

---

# 🗄️ Firestore Collections

```
users/

repositories/

documents/

conversations/

messages/

prompts/

analytics/

settings/
```

---

# 📁 Project Structure

```
StackPilot/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   │     ├── githubService.js
│   │     ├── ragService.js
│   │     ├── jinaService.js
│   │     ├── embeddingService.js
│   │     └── aiService.js
│   ├── firebase/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │    ├── components/
│   │    ├── pages/
│   │    ├── hooks/
│   │    ├── context/
│   │    ├── services/
│   │    └── utils/
│
└── README.md
```

---

# 📊 Dashboard

Displays

- Imported repositories
- Indexed documentation
- Uploaded PDFs
- Recent conversations
- Prompt library
- Storage statistics
- AI usage analytics

---

# 🔥 REST API

## Authentication

```
POST /api/v1/auth/sync

GET /api/v1/auth/profile
```

---

## Repository

```
POST /api/v1/repositories/import

GET /api/v1/repositories

DELETE /api/v1/repositories/:id
```

---

## Documentation

```
POST /api/v1/docs/import

GET /api/v1/docs

DELETE /api/v1/docs/:id
```

---

## Upload

```
POST /api/v1/upload
```

---

## AI Chat

```
POST /api/v1/chat
```

---

## Analytics

```
GET /api/v1/dashboard

GET /api/v1/analytics
```

---

# 🛡️ Security

StackPilot implements

- Firebase Authentication
- Protected routes
- Input validation
- Secure environment variables
- Rate limiting
- CORS protection

---

# ⚙️ Environment Variables

## Backend

```
PORT=

GEMINI_API_KEY=

OPENROUTER_API_KEY=

GITHUB_TOKEN=

FIREBASE_PROJECT_ID=

FIREBASE_CLIENT_EMAIL=

FIREBASE_PRIVATE_KEY=
```

---

## Frontend

```
VITE_FIREBASE_API_KEY=

VITE_FIREBASE_AUTH_DOMAIN=

VITE_FIREBASE_PROJECT_ID=

VITE_FIREBASE_STORAGE_BUCKET=

VITE_FIREBASE_APP_ID=

VITE_BACKEND_URL=
```

---

# 🛠️ Installation

## Backend

```
cd backend

npm install

npm run dev
```

---

## Frontend

```
cd frontend

npm install

npm run dev
```

---

# 🚀 Deployment

Frontend

- Vercel

Backend

- Render

Authentication

- Firebase Authentication

Database

- Firebase Firestore

Vector Database

- ChromaDB

AI Models

- Gemini API
- OpenRouter API

---

# 🧰 Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Framer Motion

### Backend

- Node.js
- Express.js

### Database

- Firebase Firestore
- ChromaDB

### AI

- Retrieval-Augmented Generation (RAG)
- Gemini API
- OpenRouter API
- Vector Embeddings
- Semantic Search

### APIs

- GitHub REST API
- Jina AI Reader API

### Authentication

- Firebase Authentication

### Tools

- Git
- GitHub
- Postman
- Vercel
- Render

---

# 📈 Future Improvements

- Private GitHub repository support
- GitHub OAuth
- VS Code Extension
- Multi-repository chat
- Repository dependency graphs
- Code execution sandbox
- Team workspaces
- Model benchmarking
- AI code review
- Pull request summarization

---

# 🎯 Vision

StackPilot aims to become an AI-native developer workspace where engineers can interact with repositories, documentation, and technical resources through natural language while receiving accurate, grounded, and source-cited responses.

---

# 📜 License

MIT License

---

# ⚠️ Disclaimer

StackPilot is intended as an AI-assisted developer productivity tool. AI-generated responses should be reviewed and verified before use in production environments.

---

# ⭐ Final Thought

StackPilot demonstrates

- Full-Stack Web Development
- Retrieval-Augmented Generation (RAG)
- Vector Database Design
- Semantic Search
- GitHub API Integration
- Documentation Indexing
- LLM Integration
- Firebase Authentication
- Modern SaaS Architecture
- Production-ready REST API Design
- AI-Powered Developer Tooling

---

## Causal Analytics � Developer Productivity Experiment

StackPilot includes a **causal-inference demonstration** built on a reproducible synthetic dataset.
It is clearly labelled *Demo Experiment* throughout the UI and API response, and uses no real StackPilot user telemetry.

### Causal Question

> Does AI assistance reduce developer task completion time?

### Variables

| Role | Variable |
|---|---|
| Treatment (T = 1) | AI assistance used |
| Treatment (T = 0) | No AI assistance (control) |
| Outcome (Y) | Task completion time (minutes) |
| Confounders | Task difficulty (1�5), Developer experience (1�10 yrs), Programming language, Task type |

### Methodology

1. **Propensity Score Estimation** � logistic regression with standardised continuous features and L2 regularisation trained with batch gradient descent (1500 epochs, lr = 0.2). Estimates P(T = 1 | confounders).
2. **Matching** � 1:1 nearest-neighbour matching without replacement, 0.05 caliper on the propensity score. Treated units with no close control neighbour are excluded, improving covariate balance.
3. **Treatment Effect** � Average Treatment Effect on the Treated (ATT) is computed as the mean within-pair outcome difference over all matched pairs.
