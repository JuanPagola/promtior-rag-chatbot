"""
FastAPI server with LangServe for Promtior RAG Chatbot.
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from langserve import add_routes

# Load environment variables
load_dotenv()

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Import the RAG chain
from app.chain import chain

# Create FastAPI app
app = FastAPI(
    title="Promtior RAG Chatbot",
    version="1.0.0",
    description="A chatbot assistant that answers questions about Promtior using RAG architecture."
)

# Configure CORS with environment-based origins
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
logger.info(f"Configured CORS allowed origins: {ALLOWED_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions."""
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with logging."""
    logger.warning(f"HTTP {exc.status_code} on {request.method} {request.url}: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors."""
    logger.warning(f"Validation error on {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"error": "Validation error", "detail": exc.errors()}
    )


@app.get("/")
async def root():
    """Redirect to the playground."""
    logger.debug("Root endpoint accessed, redirecting to playground")
    return RedirectResponse(url="/promtior/playground")


@app.get("/health")
async def health():
    """Health check endpoint."""
    logger.info("Health check requested")
    return {"status": "healthy", "service": "promtior-rag-chatbot"}


# Add LangServe routes for the RAG chain
add_routes(
    app,
    chain,
    path="/promtior",
    enable_feedback_endpoint=True,
    enable_public_trace_link_endpoint=True,
)

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
