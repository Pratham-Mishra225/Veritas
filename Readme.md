# Veritas

Veritas is a misinformation analysis system that extracts claims from text or URLs, verifies them with trusted sources, and produces a credibility score with citations. It includes a React-based frontend and an Express API backed by MongoDB, ChromaDB, and Google Gemini.

## Key capabilities

- Claim extraction and verification for text or URLs
- Source-backed verdicts (true, misleading, false) with confidence scoring
- Shareable public analysis links
- Firebase authentication with a local dev bypass
- RAG pipeline that uses ChromaDB + embeddings + web search

## Architecture overview

- **Frontend**: React + TanStack Router + Vite; Firebase Auth; optional mock API mode
- **Backend**: Express API; MongoDB for analysis storage; ChromaDB for vector search; Google Gemini for LLM + embeddings
- **RAG pipeline**: Claim extraction -> query generation -> document retrieval -> verification -> scoring -> report

## Tech stack

- **Backend**: Node.js, Express, Mongoose, Firebase Admin, LangGraph, Gemini SDK, ChromaDB
- **Frontend**: React 19, TanStack Router/Query, Tailwind CSS, Radix UI, Vite
- **Infra**: MongoDB, ChromaDB, Firebase Auth

## Getting started

### Prerequisites

- Node.js (ESM support)
- MongoDB connection string
- ChromaDB server (local or remote)
- Google Gemini API key
- Firebase project (for auth)

### 1) Start ChromaDB

From the backend folder:

```bash
chroma run --path ./chroma_db
```

### 2) Configure backend environment

Create `backend/.env`:

```bash
# Required
MONGODB_URI=mongodb://localhost:27017/veritas
GEMINI_API_KEY=your_gemini_api_key

# Firebase auth (choose one)
FIREBASE_SERVICE_ACCOUNT_PATH=../veritas-54208-firebase-adminsdk-fbsvc-ae40e4df98.json
# or use GOOGLE_APPLICATION_CREDENTIALS

# Optional
PORT=3001
CORS_ORIGIN=http://localhost:5173
DISABLE_AUTH=true
DEV_USER_ID=dev_local
PUBLIC_APP_URL=http://localhost:5173

# Rate limits
RATE_LIMIT_WRITE_PER_MIN=20
RATE_LIMIT_READ_PER_MIN=120

# Gemini models
GEMINI_CHAT_MODEL=gemini-2.0-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004

# ChromaDB
CHROMA_HOST=localhost
CHROMA_PORT=8000
CHROMA_SSL=false
CHROMA_TRUSTED_COLLECTION=veritas_trusted_sources

# Web search (optional)
SERPAPI_API_KEY=
SERPER_API_KEY=
WEB_SEARCH_TIMEOUT_MS=12000

# Fetching / payload limits
URL_FETCH_TIMEOUT_MS=15000
JSON_BODY_LIMIT=1mb
```

### 3) Run the backend

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:3001`. Visiting `/` returns a human-readable API doc page.

### 4) Configure frontend environment

Create `frontend/.env`:

```bash
# Firebase client config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=

# API routing
VITE_API_BASE_URL=/api

# Mock mode (true by default)
VITE_USE_MOCK_API=false
```

### 5) Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:3001`.

## API summary

The backend exposes a simple REST API. All routes are prefixed with `/api`.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | /health | No | Health check for MongoDB and ChromaDB |
| POST | /analyze | Yes | Analyze text or URL |
| GET | /history | Yes | List recent analyses |
| GET | /analysis/:id | Yes | Fetch analysis by id |
| POST | /analysis/:id/share | Yes | Enable public share link |
| GET | /share/:shareId | No | Fetch a shared analysis |

Authentication uses Firebase ID tokens in the `Authorization: Bearer <token>` header. For local development, set `DISABLE_AUTH=true` to bypass auth.

## Project structure

```
backend/
	server.js
	src/
		app.js
		agents/
		controllers/
		rag/
		routes/
		services/
		utils/
frontend/
	src/
		routes/
		components/
		lib/
```

## Common scripts

### Backend

- `npm run dev` - start API with file watch
- `npm run start` - run production server

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - build for production
- `npm run preview` - preview the build

## Troubleshooting

- **Auth errors**: Set `DISABLE_AUTH=true` for local testing or ensure Firebase Admin credentials are configured.
- **Gemini errors**: Confirm `GEMINI_API_KEY` is set and valid.
- **Chroma down**: Start ChromaDB or verify `CHROMA_HOST`/`CHROMA_PORT`.
- **No web results**: Configure `SERPAPI_API_KEY` or `SERPER_API_KEY`.


