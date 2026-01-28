# Project Overview - Promtior RAG Chatbot

## Approach and Solution

### Challenge Summary
The goal was to develop a chatbot assistant using RAG (Retrieval Augmented Generation) architecture that can answer questions about Promtior, based on the LangChain library and deployed to the cloud.

### Implementation Logic

#### 1. Data Preparation
I created a comprehensive knowledge base about Promtior by:
- Extracting information from the technical test PDF document
- Creating a structured text file (`data/promtior_info.txt`) with company details
- Including the original PDF as an additional source for bonus points

#### 2. Document Ingestion Pipeline (`app/ingest.py`)
The ingestion process:
1. **Load Documents**: Uses LangChain's `TextLoader` for .txt files and `PyPDFLoader` for PDF files
2. **Split into Chunks**: Applies `RecursiveCharacterTextSplitter` with 1000-character chunks and 200-character overlap to maintain context
3. **Create Embeddings**: Uses OpenAI's `text-embedding-3-small` model for efficient, high-quality embeddings
4. **Store in FAISS**: Saves the vectorstore locally for fast similarity search

#### 3. RAG Chain (`app/chain.py`)
The chain implements the RAG pattern using LangChain Expression Language (LCEL):
1. **Retriever**: Loads FAISS vectorstore and retrieves top 4 most relevant documents
2. **Prompt Template**: Custom prompt that positions the assistant as a Promtior expert
3. **LLM**: GPT-3.5-turbo for generating responses
4. **Chain Composition**: Uses `RunnableParallel` to fetch context and pass question simultaneously

#### 4. API Server (`app/server.py`)
FastAPI server with:
- CORS middleware for cross-origin requests
- LangServe routes at `/promtior` for the RAG chain
- Built-in playground at `/promtior/playground`
- Health check endpoint at `/health` for Railway

#### 5. Frontend Application (`frontend/`)
Modern React 19 frontend with:
- **HeroUI v3**: Beta UI component library with Tailwind CSS v4
- **Promtior Branding**: Custom theme using Promtior's teal and dark color palette
- **Chat Interface**: Claude-style messaging with user/assistant bubbles
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Technology Choices

#### Backend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | LangChain + LangServe | Required by the challenge, excellent RAG support |
| LLM | GPT-3.5-turbo | Good balance of cost and quality |
| Embeddings | text-embedding-3-small | Latest OpenAI embedding model, cost-effective |
| Vector Store | FAISS | Fast, local, no external dependencies |
| Server | FastAPI | Native integration with LangServe |
| Deployment | Railway | Simple deployment, as suggested in the challenge |

#### Frontend

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | React 19 | Latest React with improved performance |
| Build Tool | Vite | Fast HMR, modern ESM-first approach |
| UI Library | HeroUI v3 (beta) | Modern components with Tailwind v4 integration |
| CSS | Tailwind CSS v4 | New CSS-first configuration, smaller bundle |
| Icons | @gravity-ui/icons | Clean, consistent icon set |

### Main Challenges and Solutions

#### Challenge 1: Vectorstore Initialization
**Problem**: The vectorstore needs to exist before the server can start, but in Docker the ingestion must happen during build time.

**Solution**: The Dockerfile runs `python -m app.ingest` during the build phase, ensuring the vectorstore is ready when the container starts.

#### Challenge 2: FAISS Deserialization Security
**Problem**: FAISS `load_local` requires explicit permission for deserialization.

**Solution**: Added `allow_dangerous_deserialization=True` parameter since we control both the creation and loading of the vectorstore.

#### Challenge 3: Environment Variables in Docker
**Problem**: OpenAI API key must be available during both build (for ingestion) and runtime (for queries).

**Solution**: Railway injects environment variables at build time when using a Dockerfile, so the same `OPENAI_API_KEY` works for both phases.

#### Challenge 4: Frontend API Connectivity
**Problem**: Frontend needs to communicate with backend during development and production.

**Solution**: Vite's proxy configuration forwards `/promtior` requests to the backend during development. In production, the frontend can be served statically or configured with `VITE_API_URL`.

### Project Structure

```
promtior-rag-chatbot/
├── app/
│   ├── __init__.py       # Package init
│   ├── server.py         # FastAPI + LangServe server
│   ├── chain.py          # RAG chain with LCEL
│   └── ingest.py         # Document loader and vectorstore creator
├── data/
│   ├── promtior_info.txt # Company information
│   └── AI_Engineer.pdf   # Original challenge PDF
├── doc/
│   └── PROJECT_OVERVIEW.md  # This file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.tsx     # Main chat component
│   │   │   ├── Message.tsx  # Message bubble component
│   │   │   └── Header.tsx   # App header
│   │   ├── App.tsx          # Root component
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Tailwind + theme styles
│   ├── package.json
│   └── vite.config.ts
├── vectorstore/          # Generated FAISS index (gitignored)
├── .env                  # API key (gitignored)
├── .env.example          # Template for .env
├── .gitignore
├── requirements.txt
├── Dockerfile
├── railway.toml
└── README.md
```

### Frontend Architecture

#### Component Hierarchy

```
App
├── Header          # Logo and title
└── Chat           # Main chat container
    ├── ScrollShadow   # Scrollable message area
    │   └── Message[]  # Individual messages
    │       └── Avatar # User/assistant avatar
    ├── Suggestions    # Quick question buttons
    └── InputArea      # Text input + send button
```

#### State Management
- Local React state with `useState` for simplicity
- Messages array with role, content, and timestamp
- Loading state for API requests
- Input controlled component

#### Styling Approach
- CSS Variables for Promtior brand colors
- Tailwind utility classes for layout
- Custom animations for message entry
- HeroUI components for consistent UI

### Testing the Solution

The chatbot correctly answers the required questions:

1. **"What services does Promtior offer?"**
   - AI Consulting
   - Organizational Consulting
   - RAG Implementation
   - Generative AI Solutions
   - Business Model Innovation
   - Automation

2. **"When was the company founded?"**
   - May 2023

### Future Improvements

1. **Conversation Memory**: Add chat history for multi-turn conversations
2. **Streaming Responses**: Enable token-by-token streaming for better UX
3. **Source Citations**: Show which documents were used for each answer
4. **Multiple Vector Stores**: Support different knowledge bases for different topics
5. **Dark/Light Mode Toggle**: Allow users to switch themes
6. **Message Persistence**: Save chat history to localStorage or backend
