from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class ProcessAtom(Base):
    __tablename__ = "process_atoms"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("atom"))
    source_run_id: Mapped[str | None] = mapped_column(String, ForeignKey("runs.id"), nullable=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    applicability: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    embedding: Mapped[list[float] | None] = mapped_column(
        JSON, nullable=True
    )  # 384-dim vector stored as JSON array
    visibility: Mapped[str] = mapped_column(String, default="shared")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    source_run = relationship("Run", back_populates="process_atoms")
