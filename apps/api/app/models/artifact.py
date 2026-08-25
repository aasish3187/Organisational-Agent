from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class Artifact(Base):
    __tablename__ = "artifacts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("art"))
    task_id: Mapped[str] = mapped_column(
        String, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False
    )
    project_id: Mapped[str | None] = mapped_column(String, ForeignKey("projects.id"), nullable=True)
    type: Mapped[str] = mapped_column(
        String, nullable=False
    )  # IdeaContract|EvidenceBrief|ProductSpec|...
    schema_version: Mapped[str] = mapped_column(String, default="1.0")
    version: Mapped[int] = mapped_column(Integer, default=1)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    content_hash: Mapped[str] = mapped_column(String, nullable=False)  # sha256 of canonical JSON
    confidence: Mapped[Decimal | None] = mapped_column(Numeric(3, 2), nullable=True)  # 0.00-1.00
    assumptions: Mapped[list[str] | None] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(
        String, default="submitted"
    )  # submitted|approved|rejected|superseded
    review_state: Mapped[str | None] = mapped_column(
        String, nullable=True
    )  # pending|passed|revision_requested|escalated
    producer_role: Mapped[str | None] = mapped_column(String, nullable=True)
    producer_model: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    task = relationship("Task", back_populates="artifacts")
    project = relationship("Project", back_populates="artifacts")
    claims = relationship("Claim", back_populates="artifact", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="artifact")
    evidence = relationship("Evidence", back_populates="artifact")
