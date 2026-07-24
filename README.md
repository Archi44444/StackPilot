# StackPilot

StackPilot is an intelligent, multi-tenant coding assistant powered by Retrieval-Augmented Generation (RAG). It brings chat, code understanding, and your project's unique documentation into one secure, deliberate workspace. StackPilot aims to act as an integrated developer companion that not only helps you write code but understands the context of the libraries and frameworks you are using.

## 🚀 Key Features

*   **Context-Aware AI Chat:** Ask coding questions and get natural, tailored answers instead of generic boilerplate.
*   **📚 RAG-Powered Knowledge Base:** Upload your own PDFs, Markdown, or TXT documents. StackPilot chunks, embeds, and stores them in ChromaDB so the AI can use *your* documentation as context.
*   **🐞 AI Debugger:** Paste an error and immediately get the root cause, an explanation, and corrected code.
*   **🧩 Code Explainer:** Get detailed, line-by-line explanations for complex snippets.
*   **🔒 Secure & Multi-Tenant:** Uses Firebase Authentication for identity. Your uploaded documents and chat histories are scoped strictly to your account.
*   **⚡ Modern Architecture:** Built with React, Tailwind CSS, Node.js, Express, and ChromaDB. Powered by Gemini/OpenRouter API.

## 🛠️ Technology Stack

**Frontend:**
*   React.js with Vite
*   Tailwind CSS & Framer Motion
*   React Router & Axios

**Backend:**
*   Node.js & Express
*   `@google/genai` (Gemini API) & OpenRouter API
*   LangChain (Document parsing & RAG logic)
*   ChromaDB (Vector database)
*   Firebase Admin SDK (Auth verification)

**Database & Auth:**
*   Firebase Authentication (Email & Google login)
*   Firestore (Conversation & Prompt storage)

## 🏁 Getting Started

### Prerequisites
*   Node.js (v20+)
*   A Firebase project with Firestore and Auth enabled
*   API keys for Gemini and OpenRouter

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy the example environment file and fill in your keys:
```bash
cp .env.example .env
```

Start the backend server (starts on `http://localhost:5000`):
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Copy the example environment file and add your Firebase config:
```bash
cp .env.example .env
```

Start the frontend development server:
```bash
npm run dev
```

### 3. Firebase Setup
Ensure you configure your Firestore security rules correctly so that authenticated users can only access their own documents (conversations, messages, and prompts). See the `docs/` folder for Firestore initialization guidelines.

## 🤝 Contributing
Contributions are welcome! Please ensure you test your changes on both the frontend and backend before submitting a pull request.

---
*Built for focused work.*
