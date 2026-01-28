"""
RAG chain logic for Promtior Chatbot.
Implements retrieval-augmented generation using LangChain Expression Language (LCEL).
"""

import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

# Load environment variables
load_dotenv()

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
VECTORSTORE_DIR = BASE_DIR / "vectorstore"

# Prompt template for Promtior assistant
PROMPT_TEMPLATE = """You are a helpful assistant for Promtior, an AI consulting company founded in May 2023.
Use the following context to answer the user's question about Promtior.
If you don't know the answer based on the context, say so politely.
Always be professional and informative.

Context:
{context}

Question: {question}

Answer:"""


def format_docs(docs):
    """Format retrieved documents into a single string."""
    return "\n\n".join(doc.page_content for doc in docs)


def get_retriever():
    """Load the FAISS vectorstore and return a retriever."""
    if not VECTORSTORE_DIR.exists():
        raise ValueError(
            "Vectorstore not found. Please run 'python -m app.ingest' first."
        )

    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    vectorstore = FAISS.load_local(
        str(VECTORSTORE_DIR),
        embeddings,
        allow_dangerous_deserialization=True
    )

    # Return retriever with k=4 documents
    return vectorstore.as_retriever(search_kwargs={"k": 4})


def create_rag_chain():
    """Create the RAG chain using LCEL."""
    # Initialize components
    retriever = get_retriever()

    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0.7
    )

    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

    # Build RAG chain using LCEL
    rag_chain = (
        RunnableParallel(
            context=retriever | format_docs,
            question=RunnablePassthrough()
        )
        | prompt
        | llm
        | StrOutputParser()
    )

    return rag_chain


# Create chain instance for import
chain = create_rag_chain()
