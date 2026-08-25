from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class Approval(Base):
    __tablename__ = "approvals"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("apr"))
    run_id: Mapped[str] = mapped_column(
        String, ForeignKey("runs.id", ondelete="CASCADE"), nullable=False
    )
    policy_id: Mapped[str] = mapped_column(String, nullable=False)  # P-03, etc.
    gate_type: Mapped[str] = mapped_column(
        String, nullable=False
    )  # sensitive-data-retention|external-write|...
    proposal: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    alternatives: Mapped[list[Any] | None] = mapped_column(JSON, default=list)
    risk_level: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(
        String, default="PENDING"
    )  # PENDING|APPROVED|REJECTED|CHANGES_REQUESTED
    human_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    human_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    run = relationship("Run", back_populates="approvals")
