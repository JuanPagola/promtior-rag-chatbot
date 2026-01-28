"""
Document ingestion script for Promtior RAG Chatbot.
Loads documents from data/ folder, creates embeddings, and stores in FAISS.
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

# Load environment variables
load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
VECTORSTORE_DIR = BASE_DIR / "vectorstore"


def load_documents():
    """Load all documents from the data directory."""
    documents = []

    # Load text files
    txt_files = list(DATA_DIR.glob("*.txt"))
    for txt_file in txt_files:
        print(f"Loading text file: {txt_file}")
        loader = TextLoader(str(txt_file), encoding="utf-8")
        documents.extend(loader.load())

    # Load PDF files
    pdf_files = list(DATA_DIR.glob("*.pdf"))
    for pdf_file in pdf_files:
        print(f"Loading PDF file: {pdf_file}")
        loader = PyPDFLoader(str(pdf_file))
        documents.extend(loader.load())

    print(f"Loaded {len(documents)} documents")
    return documents


def split_documents(documents):
    """Split documents into chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    chunks = text_splitter.split_documents(documents)
    print(f"Split into {len(chunks)} chunks")
    return chunks


def create_vectorstore(chunks):
    """Create FAISS vectorstore from document chunks."""
    print("Creating embeddings and vectorstore...")

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.from_documents(chunks, embeddings)

    # Save vectorstore locally
    VECTORSTORE_DIR.mkdir(exist_ok=True)
    vectorstore.save_local(str(VECTORSTORE_DIR))
    print(f"Vectorstore saved to {VECTORSTORE_DIR}")

    return vectorstore


def main():
    """Main ingestion pipeline."""
    print("Starting document ingestion...")

    # Check for API key
    if not os.getenv("OPENAI_API_KEY"):
        raise ValueError("OPENAI_API_KEY environment variable not set")

    # Load documents
    documents = load_documents()

    if not documents:
        raise ValueError("No documents found in data/ directory")

    # Split into chunks
    chunks = split_documents(documents)

    # Create and save vectorstore
    create_vectorstore(chunks)

    print("Ingestion complete!")


if __name__ == "__main__":
    main()
