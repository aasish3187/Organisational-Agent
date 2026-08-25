from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("rev"))
    artifact_id: Mapped[str | None] = mapped_column(String, ForeignKey("artifacts.id"), nullable=True)
    run_id: Mapped[str | None] = mapped_column(String, ForeignKey("runs.id"), nullable=True)
    reviewer_role: Mapped[str] = mapped_column(String, nullable=False)
    verdict: Mapped[str] = mapped_column(String, nullable=False)  # PASS|REVISE|ESCALATE
    coverage_met: Mapped[list[Any] | None] = mapped_column(JSON, default=list)
    coverage_missing: Mapped[list[Any] | None] = mapped_column(JSON, default=list)
    contradictions: Mapped[list[Any] | None] = mapped_column(JSON, default=list)
    unsupported_claims: Mapped[list[Any] | None] = mapped_column(JSON, default=list)
    revision_tasks: Mapped[list[Any] | None] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    artifact = relationship("Artifact", back_populates="reviews")
    run = relationship("Run", back_populates="reviews")
