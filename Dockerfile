FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Render sets PORT env var)
EXPOSE 8000

# Run ingestion at startup (needs OPENAI_API_KEY), then start server
CMD ["sh", "-c", "python -m app.ingest && uvicorn app.server:app --host 0.0.0.0 --port ${PORT:-8000}"]
