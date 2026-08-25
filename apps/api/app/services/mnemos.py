from typing import Any

import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.nanoid import new_id
from app.models.process_atom import ProcessAtom

# Pre-seeded sample atoms from Section 15 of spec
PRESEEDED_ATOMS = [
    {
        "id": "atom_edtech_01",
        "name": "Privacy/Risk role required when platform stores student learning history",
        "applicability": {
            "domain": "edtech",
            "deliverable_type": "platform-blueprint",
            "data_sensitivity": "student-data",
        },
        "action": "Activate Privacy/Risk Analyst; require explicit approval gate on retention duration",
        "purpose": "Prevents silent decisions about sensitive data retention reaching the final blueprint unreviewed",
        "tags": ["edtech", "privacy", "student-data", "approval-gate"],
    },
    {
        "id": "atom_edtech_02",
        "name": "Multilingual NLP requires regional language corpus validation",
        "applicability": {
            "domain": "edtech",
            "deliverable_type": "ai-architecture",
            "data_sensitivity": "internal",
        },
        "action": "Specify evaluation dataset covering target languages; flag coverage gaps as risks",
        "purpose": "Prevents deployment of a multilingual system that silently fails on minority languages",
        "tags": ["edtech", "multilingual", "nlp", "evaluation"],
    },
    {
        "id": "atom_marketplace_01",
        "name": "Perishability risk protocol for surplus food distribution",
        "applicability": {
            "domain": "marketplace",
            "deliverable_type": "logistics-architecture",
            "data_sensitivity": "internal",
        },
        "action": "Activate System Architect for real-time dispatch matching with expiration windows",
        "purpose": "Ensures time-sensitive matching reduces food spoilage rate",
        "tags": ["marketplace", "logistics", "perishability", "matching"],
    },
]

def cosine_sim(a: list[float], b: list[float]) -> float:
    va, vb = np.array(a, dtype=float), np.array(b, dtype=float)
    denom = float(np.linalg.norm(va) * np.linalg.norm(vb) + 1e-9)
    return float(np.dot(va, vb) / denom)

def compute_keyword_similarity(query: str, atom_text: str) -> float:
    """Fallback similarity score based on term overlap."""
    q_words = set(query.lower().split())
    a_words = set(atom_text.lower().split())
    if not q_words or not a_words:
        return 0.0
    overlap = len(q_words.intersection(a_words))
    return overlap / max(len(q_words), 1)

def row_to_dict(atom: ProcessAtom) -> dict[str, Any]:
    return {
        "atom_id": atom.id,
        "name": atom.name,
        "applicability": atom.applicability,
        "action": atom.action,
        "purpose": atom.purpose,
        "tags": atom.tags,
        "source_run_id": atom.source_run_id,
        "visibility": atom.visibility,
    }

async def retrieve_atoms(
    session: AsyncSession,
    domain: str,
    deliverable_type: str,
    query_text: str,
    top_k: int = 5,
) -> list[dict[str, Any]]:
    """
    Step 1: Tag-filter by domain or tags
    Step 2: Semantic / keyword rerank candidates
    Returns top_k most relevant process atoms as dicts
    """
    stmt = select(ProcessAtom)
    result = await session.execute(stmt)
    all_atoms = result.scalars().all()

    candidates: list[dict[str, Any]] = []

    if not all_atoms:
        for pa in PRESEEDED_ATOMS:
            tags = pa.get("tags", [])
            if domain in tags or pa.get("applicability", {}).get("domain") == domain:
                candidates.append(pa)
            elif not candidates:
                candidates.append(pa)
    else:
        for atom in all_atoms:
            tags = atom.tags or []
            if domain in tags or (isinstance(atom.applicability, dict) and atom.applicability.get("domain") == domain):
                candidates.append(row_to_dict(atom))
            else:
                candidates.append(row_to_dict(atom))

    if not candidates:
        return []

    scored = []
    for c in candidates:
        combined = f"{c.get('name', '')} {c.get('action', '')} {c.get('purpose', '')}"
        sim = compute_keyword_similarity(query_text, combined)
        if c.get("applicability", {}).get("domain") == domain:
            sim += 0.5
        scored.append((sim, c))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:top_k]]

async def write_atoms(
    session: AsyncSession,
    run_id: str,
    atoms_data: list[dict[str, Any]],
) -> list[str]:
    ids = []
    for data in atoms_data:
        atom_id = data.get("id") or new_id("atom")
        atom = ProcessAtom(
            id=atom_id,
            source_run_id=run_id,
            name=data["name"],
            applicability=data["applicability"],
            action=data["action"],
            purpose=data["purpose"],
            tags=data.get("tags", []),
            embedding=data.get("embedding"),
            visibility=data.get("visibility", "shared"),
        )
        session.add(atom)
        ids.append(atom.id)

    await session.commit()
    return ids

class MnemosService:
    async def retrieve_atoms(self, session: AsyncSession, domain: str, deliverable_type: str, query_text: str, top_k: int = 5):
        return await retrieve_atoms(session, domain, deliverable_type, query_text, top_k)

    async def write_atoms(self, session: AsyncSession, run_id: str, atoms_data: list[dict[str, Any]]):
        return await write_atoms(session, run_id, atoms_data)

    async def learn_atom(
        self,
        session: AsyncSession,
        name: str,
        purpose: str,
        action: str,
        applicability: dict[str, Any],
        tags: list[str],
        source_run_id: str,
    ) -> str:
        atom = ProcessAtom(
            id=new_id("atom"),
            source_run_id=source_run_id,
            name=name,
            applicability=applicability,
            action=action,
            purpose=purpose,
            tags=tags,
            visibility="shared",
        )
        session.add(atom)
        await session.commit()
        return atom.id

mnemos_service = MnemosService()
