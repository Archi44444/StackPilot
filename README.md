# 🚀 StackPilot

### AI-Powered Developer Copilot for Codebases, Documentation & Technical Knowledge

**StackPilot** is a full-stack AI developer workspace that lets developers interact with GitHub repositories, technical documentation, PDFs, Markdown files, and codebases using natural language.

It combines **Retrieval-Augmented Generation (RAG)**, vector embeddings, semantic search, repository indexing, and LLM-powered reasoning to provide **context-aware, grounded, and source-cited answers**.

> 💡 **Live Demo:** https://stack-pilot-jet.vercel.app

---

## ✨ Why StackPilot?

Understanding an unfamiliar codebase often means jumping between source files, documentation, GitHub issues, and search engines.

StackPilot brings these resources into one AI-powered workspace.

You can ask questions such as:

* 🧠 *"Explain this project."*
* 🔍 *"Where is authentication implemented?"*
* 📁 *"Explain the folder structure."*
* ⚙️ *"How does this function work?"*
* 📚 *"Summarize this documentation."*
* 🚀 *"Generate an onboarding guide for this repository."*
* 🛠️ *"Suggest improvements to this implementation."*

Responses are grounded in retrieved project context and can include **source citations** for verification.

---

# 🌟 Key Features

### 🤖 AI Developer Chat

Ask natural-language questions about your imported repositories, documentation, and uploaded knowledge sources.

### 🐙 GitHub Repository Intelligence

Import public GitHub repositories and analyze:

* Repository metadata
* README files
* Folder structures
* Source files
* Documentation
* Code context

### 📚 Documentation Intelligence

Import technical documentation and convert it into a searchable knowledge base.

Supports documentation for technologies such as:

* React
* Next.js
* Node.js
* Express
* Firebase
* Tailwind CSS
* FastAPI
* LangChain
* Python
* And other developer documentation

### 📄 PDF & Markdown Knowledge Base

Upload technical resources including:

* Research papers
* API documentation
* Technical books
* Manuals
* Notes
* Markdown files

Content is processed, embedded, and made available for semantic retrieval.

### 🔎 Semantic Search

Instead of relying only on keyword matching, StackPilot retrieves context based on the **semantic meaning of a user's query**.

### 📌 Source-Cited Responses

Retrieved context is passed to the LLM so that responses remain grounded in the indexed knowledge base and can reference relevant sources.

### 📝 Prompt Library

Save and manage reusable developer prompts.

* Create prompts
* Edit prompts
* Delete prompts
* Reuse prompts across conversations

### 💬 Conversation History

Persist:

* Conversations
* AI responses
* Repository-specific chats
* Retrieved sources
* Message history

### 📊 Developer Dashboard

View:

* Imported repositories
* Indexed documentation
* Uploaded files
* Recent conversations
* Prompt library
* Storage information
* AI usage analytics

---

# 🧠 RAG Architecture

StackPilot uses a Retrieval-Augmented Generation pipeline to provide context-aware responses.

```text
             User Query
                 │
                 ▼
        Query Processing
                 │
                 ▼
        Semantic Retrieval
                 │
                 ▼
          ChromaDB Search
                 │
                 ▼
       Relevant Context
                 │
                 ▼
        Prompt Construction
                 │
                 ▼
       Gemini / OpenRouter
                 │
                 ▼
       Grounded AI Response
                 │
                 ▼
          Source Citations
```

### Knowledge Ingestion Pipeline

```text
GitHub Repository
Documentation
PDF / Markdown
       │
       ▼
Content Extraction
       │
       ▼
Text Chunking
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
LLM Context Injection
```

---

# 🧩 System Architecture

```text
┌──────────────────────────────┐
│        React + Vite          │
│       Tailwind CSS           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Firebase Authentication   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Node.js + Express       │
└──────────────┬───────────────┘
               │
       ┌───────┼────────┬────────────┐
       ▼       ▼        ▼            ▼
   GitHub    Jina AI  LangChain   AI Services
     API      Reader     .js      Gemini/OpenRouter
       │        │         │            │
       └────────┴─────────┴────────────┘
                         │
                         ▼
                    ChromaDB
                         │
                         ▼
                    Firestore
```

---

# 🧪 Causal Analytics — Developer Productivity Experiment

StackPilot also includes a **causal-inference demonstration** designed to estimate whether AI assistance affects developer task completion time.

> ⚠️ **Demo Experiment:** This experiment uses a reproducible synthetic dataset and does **not** use real StackPilot user telemetry.

### Causal Question

> **Does AI assistance reduce developer task completion time?**

### Variables

| Variable             | Role                |
| -------------------- | ------------------- |
| AI Assistance        | Treatment (`T = 1`) |
| No AI Assistance     | Control (`T = 0`)   |
| Task Completion Time | Outcome (`Y`)       |
| Task Difficulty      | Confounder          |
| Developer Experience | Confounder          |
| Programming Language | Confounder          |
| Task Type            | Confounder          |

### Methodology

#### 1. Propensity Score Estimation

A logistic regression model estimates:

```text
P(T = 1 | Confounders)
```

The model uses:

* Standardised continuous features
* L2 regularisation
* Batch gradient descent
* 1,500 training epochs
* Learning rate = `0.2`

#### 2. Propensity Score Matching

Treated and control observations are matched using:

* **1:1 nearest-neighbour matching**
* **Without replacement**
* **0.05 propensity-score caliper**

Observations without a sufficiently close control match are excluded to improve covariate balance.

#### 3. Treatment Effect

The experiment estimates the:

### Average Treatment Effect on the Treated — ATT

```text
ATT = Mean(Y_treated − Y_matched_control)
```

The estimate represents the average difference in task completion time between AI-assisted developers and comparable matched developers in the synthetic experiment.

---

# 🔐 Authentication & Security

StackPilot uses Firebase Authentication and protected Express API routes.

### Authentication Flow

```text
User Login
    │
    ▼
Firebase Authentication
    │
    ▼
Authentication Token
    │
    ▼
Express Middleware
    │
    ▼
Token Verification
    │
    ▼
Protected API Routes
```

Security measures include:

* Firebase Authentication
* Protected API routes
* Token verification
* Input validation
* Rate limiting
* CORS protection
* Environment-based secrets

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* React Router
* Axios
* Firebase Authentication

## Backend

* Node.js
* Express.js
* LangChain.js

## AI / ML

* Retrieval-Augmented Generation (RAG)
* Gemini API
* OpenRouter
* Vector Embeddings
* Semantic Search
* Propensity Score Matching
* Logistic Regression
* Causal Inference

## Databases

* Firebase Firestore
* ChromaDB

## External APIs

* GitHub REST API
* Jina AI Reader API

## Deployment

* Vercel — Frontend
* Render — Backend
* Firebase — Authentication & Firestore
* ChromaDB — Vector Storage

---

# 📂 Project Structure

```text
StackPilot/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   │   ├── githubService.js
│   │   ├── ragService.js
│   │   ├── jinaService.js
│   │   ├── embeddingService.js
│   │   └── aiService.js
│   ├── firebase/
│   ├── utils/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

---

# 🔌 REST API

### Authentication

```http
POST /api/v1/auth/sync
GET  /api/v1/auth/profile
```

### Repositories

```http
POST   /api/v1/repositories/import
GET    /api/v1/repositories
DELETE /api/v1/repositories/:id
```

### Documentation

```http
POST   /api/v1/docs/import
GET    /api/v1/docs
DELETE /api/v1/docs/:id
```

### File Upload

```http
POST /api/v1/upload
```

### AI Chat

```http
POST /api/v1/chat
```

### Analytics

```http
GET /api/v1/dashboard
GET /api/v1/analytics
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/StackPilot.git
cd StackPilot
```

## 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

# 🔑 Environment Variables

### Backend

Create:

```text
backend/.env
```

```env
PORT=

GEMINI_API_KEY=
OPENROUTER_API_KEY=
GITHUB_TOKEN=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Frontend

Create:

```text
frontend/.env
```

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=

VITE_BACKEND_URL=
```

> Never commit API keys, Firebase credentials, private keys, or other secrets to GitHub.

---

# 🌐 Deployment

| Component            | Platform                |
| -------------------- | ----------------------- |
| Frontend             | Vercel                  |
| Backend              | Render                  |
| Authentication       | Firebase Authentication |
| Application Database | Firestore               |
| Vector Database      | ChromaDB                |
| LLM                  | Gemini / OpenRouter     |

---

# 🔮 Future Improvements

Planned improvements include:

* 🔒 Private GitHub repository support
* 🔑 GitHub OAuth
* 🧩 VS Code extension
* 🔗 Multi-repository conversations
* 🕸️ Repository dependency graphs
* 🧪 Secure code execution sandbox
* 👥 Team workspaces
* 📈 Model benchmarking
* 🔍 AI-powered code review
* 🔀 Pull request summarization
* 🧠 More advanced causal experiments

---

# 🎯 What This Project Demonstrates

StackPilot combines several areas of modern software engineering and AI:

* Full-stack application development
* REST API design
* RAG architecture
* Vector databases
* Semantic search
* LLM integration
* AI-powered developer tooling
* GitHub API integration
* Documentation ingestion
* Firebase authentication
* Cloud deployment
* Causal inference
* Propensity score matching
* Production-oriented backend architecture

---

# 📜 License

This project is licensed under the **MIT License**.

---

# ⚠️ Disclaimer

StackPilot is an AI-assisted developer productivity tool.

AI-generated responses may contain errors and should be reviewed and verified before being used in production systems.

---

## 🚀 Vision

StackPilot aims to evolve into an **AI-native developer workspace** where engineers can understand, search, and interact with entire software projects through natural language.

Instead of switching between repositories, documentation, PDFs, and search engines, developers can bring their technical context into one intelligent workspace.

---

# 🧠 LLM Fine-Tuning Pipeline

StackPilot includes an optional, domain-adapted **fine-tuning pipeline** for developer assistance. You can train a local model to specialize in code explanation, debugging, and programming concepts, and serve it seamlessly in production.

### Methodology
1. **Model Selection:** `Qwen/Qwen2.5-0.5B-Instruct` (Apache 2.0, 494M parameters). Optimized for low-compute environments and fast CPU fine-tuning.
2. **PEFT/LoRA Fine-Tuning:** Applies Low-Rank Adaptation (LoRA) targeting attention projection modules (`q_proj`, `v_proj`) with `r=8` and `alpha=16` (~500K trainable parameters). This adapts the model without full weight updates.
3. **Domain Dataset:** Curated 60-example developer dataset containing instruction-input-output blocks focusing on Node.js/JavaScript, Python, Java, REST APIs, Git, SQL, Docker, and algorithms.
4. **Hugging Face Hub Integration:** Once trained locally, the adapter is merged with base weights and pushed to your Hugging Face Hub registry.
5. **Node.js Production Server:** The production Express API queries the model using the stateless Hugging Face Inference API. This avoids any Python/GPU requirements on the production hosting servers.

### Run Fine-Tuning Locally

1. Install requirements:
   ```bash
   cd ml
   pip install -r requirements.txt
   ```
2. Login to Hugging Face:
   ```bash
   huggingface-cli login
   ```
3. Run training and push to Hugging Face:
   ```bash
   python finetune.py --hf-repo YOUR_USERNAME/stackpilot-dev-assistant
   ```
4. Run evaluation:
   ```bash
   python evaluate_finetuned.py --hf-repo YOUR_USERNAME/stackpilot-dev-assistant
   ```
5. Test inference locally:
   ```bash
   python fine_tuned_inference.py --question "What is a closure in JavaScript?"
   ```

