import hashlib
import logging
import re
from typing import Any
from pydantic import BaseModel

logger = logging.getLogger("nexus.rag_service")


class DocumentChunk(BaseModel):
    chunk_id: str
    project_id: str
    doc_name: str
    content: str
    keywords: list[str]


class DocumentStoreRAG:
    """
    Project-Scoped Local RAG and Document Ingestion Engine.
    Chunks user-uploaded PRDs, Specs, and Notes for Specialist Agents.
    """

    def __init__(self):
        # In-memory index keyed by project_id
        self._project_chunks: dict[str, list[DocumentChunk]] = {}

    def ingest_document(self, project_id: str, doc_name: str, text: str) -> int:
        """Splits document into semantic chunks and indexes them for the project."""
        if project_id not in self._project_chunks:
            self._project_chunks[project_id] = []

        # Split by double newline or headers
        raw_chunks = [c.strip() for c in re.split(r"\n\s*\n|(?=^#{1,3}\s)", text, flags=re.MULTILINE) if len(c.strip()) > 30]
        if not raw_chunks:
            raw_chunks = [text.strip()]

        created_count = 0
        for i, chunk_text in enumerate(raw_chunks):
            chunk_hash = hashlib.sha256(chunk_text.encode("utf-8")).hexdigest()[:12]
            keywords = [w.lower() for w in re.findall(r"\b[a-zA-Z]{4,}\b", chunk_text)]
            chunk = DocumentChunk(
                chunk_id=f"chk_{chunk_hash}_{i}",
                project_id=project_id,
                doc_name=doc_name,
                content=chunk_text,
                keywords=list(set(keywords)),
            )
            self._project_chunks[project_id].append(chunk)
            created_count += 1

        logger.info("Ingested %d chunks from '%s' for project '%s'", created_count, doc_name, project_id)
        return created_count

    def retrieve_relevant_chunks(self, project_id: str, query: str, top_k: int = 3) -> list[DocumentChunk]:
        """Retrieves most relevant document chunks for a specialist agent query."""
        chunks = self._project_chunks.get(project_id, [])
        if not chunks:
            return []

        query_words = set(w.lower() for w in re.findall(r"\b[a-zA-Z]{4,}\b", query))
        if not query_words:
            return chunks[:top_k]

        def score_chunk(c: DocumentChunk) -> int:
            return len(query_words.intersection(set(c.keywords)))

        scored = sorted(chunks, key=score_chunk, reverse=True)
        return [c for c in scored if score_chunk(c) > 0][:top_k] or chunks[:top_k]


# Singleton
rag_service = DocumentStoreRAG()
