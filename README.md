# Promtior RAG Chatbot

A chatbot assistant that uses RAG (Retrieval Augmented Generation) architecture to answer questions about Promtior, built with LangChain and LangServe, featuring a modern React frontend.

## Features

- RAG-based question answering about Promtior
- Modern React 19 frontend with HeroUI v3
- Built-in playground UI for testing (backend)
- REST API with LangServe
- Docker support for easy deployment
- Ready for Railway deployment

## Tech Stack

### Backend
- **Framework**: LangChain + LangServe
- **LLM**: OpenAI GPT-3.5-turbo
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: FAISS
- **Server**: FastAPI

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **UI Library**: HeroUI v3 (beta)
- **CSS**: Tailwind CSS v4
- **Icons**: @gravity-ui/icons

### Deployment
- **Platform**: Render (Backend: Web Service, Frontend: Static Site)

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+ (with pnpm recommended)
- OpenAI API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd promtior-rag-chatbot
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   # ALLOWED_ORIGINS defaults to http://localhost:5173 for local dev
   ```

5. **Run document ingestion**
   ```bash
   python -m app.ingest
   ```

6. **Start the server**
   ```bash
   uvicorn app.server:app --reload --port 8000
   ```

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   pnpm install
   # Or with npm: npm install
   ```

2. **Start development server**
   ```bash
   pnpm dev
   # Or with npm: npm run dev
   ```

3. **Open the app**
   - Frontend: http://localhost:5173
   - Backend Playground: http://localhost:8000/promtior/playground

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Redirects to playground |
| `GET /health` | Health check |
| `GET /promtior/playground` | Interactive UI (backend) |
| `POST /promtior/invoke` | Query the chatbot |
| `POST /promtior/stream` | Stream responses |

### Example API Request

```bash
curl -X POST http://localhost:8000/promtior/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": "What services does Promtior offer?"}'
```

## Deployment on Render

### Backend (Web Service)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `promtior-rag-backend`
     - **Runtime**: Docker
     - **Dockerfile Path**: `./Dockerfile`
   - Add environment variables:
     - `OPENAI_API_KEY` = your OpenAI API key
     - `ALLOWED_ORIGINS` = `https://promtior-rag-frontend.onrender.com` (add after frontend is created)
   - Click "Create Web Service"

3. **Copy the backend URL** (e.g., `https://promtior-rag-backend.onrender.com`)

### Frontend (Static Site)

1. **Create Static Site on Render**
   - Click "New" → "Static Site"
   - Connect the same GitHub repository
   - Configure:
     - **Name**: `promtior-rag-frontend`
     - **Root Directory**: `frontend`
     - **Build Command**: `pnpm install && pnpm build`
     - **Publish Directory**: `dist`
   - Add environment variable: `VITE_API_URL` = your backend URL from step 3
   - Click "Create Static Site"

2. **Access your chatbot**
   - Frontend: `https://promtior-rag-frontend.onrender.com`
   - Backend Playground: `https://promtior-rag-backend.onrender.com/promtior/playground`

## Project Structure

```
promtior-rag-chatbot/
├── app/
│   ├── __init__.py       # Package init
│   ├── server.py         # FastAPI + LangServe server
│   ├── chain.py          # RAG chain logic
│   └── ingest.py         # Document ingestion
├── data/
│   ├── promtior_info.txt # Company information
│   └── AI_Engineer.pdf   # Source document
├── doc/
│   └── PROJECT_OVERVIEW.md
├── frontend/
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── App.tsx       # Main app component
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Tailwind + theme styles
│   ├── package.json
│   └── vite.config.ts
├── vectorstore/          # Generated (gitignored)
├── .env.example
├── .gitignore
├── requirements.txt
├── Dockerfile
├── render.yaml
├── railway.toml          # (alternative: Railway)
└── README.md
```

## Sample Questions

- "What services does Promtior offer?"
- "When was Promtior founded?"
- "Who are Promtior's clients?"
- "What is a Bionic Organization?"
- "Who founded Promtior?"

## Backend Features

- **Global Error Handling**: Structured error responses for all exceptions
- **Structured Logging**: Timestamped logs with level and context
- **CORS Security**: Configurable allowed origins via environment variable
- **Health Check**: `/health` endpoint for monitoring

## Frontend Features

- **Modern Chat UI**: Claude-style interface with message bubbles
- **Markdown Rendering**: Assistant responses render markdown (bold, code, lists, links)
- **Copy Messages**: One-click copy button on assistant messages
- **Promtior Branding**: Custom teal/dark theme matching Promtior's brand
- **Responsive Design**: Works on desktop and mobile with sticky input footer
- **Suggested Questions**: Toggle-able quick-start buttons for common queries
- **Loading States**: Typing indicator while waiting for responses
- **Smooth Animations**: Message fade-in and scroll shadow effects
- **Chat History**: Persistent localStorage with clear confirmation modal
- **Keyboard Shortcuts**: Cmd/Ctrl+Enter to send messages
- **Request Timeout**: 30-second timeout with user-friendly error messages

## Documentation

See [doc/PROJECT_OVERVIEW.md](doc/PROJECT_OVERVIEW.md) for detailed implementation documentation.

## License

MIT
