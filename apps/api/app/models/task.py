from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("tsk"))
    run_id: Mapped[str] = mapped_column(
        String, ForeignKey("runs.id", ondelete="CASCADE"), nullable=False
    )
    owner_agent_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("agent_instances.id"), nullable=True
    )
    role: Mapped[str] = mapped_column(String, nullable=False)
    depends_on: Mapped[list[str] | None] = mapped_column(JSON, default=list)  # array of task IDs
    status: Mapped[str] = mapped_column(
        String, default="QUEUED"
    )  # QUEUED|RUNNING|REVIEW|REVISION|COMPLETED|FAILED
    output_schema: Mapped[str] = mapped_column(String, nullable=False)
    token_budget: Mapped[int] = mapped_column(Integer, default=5000)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    review_required: Mapped[bool] = mapped_column(Boolean, default=False)
    revision_count: Mapped[int] = mapped_column(Integer, default=0)
    risk_level: Mapped[str] = mapped_column(String, default="low")  # low|medium|high
    queued_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    run = relationship("Run", back_populates="tasks")
    owner_agent = relationship("AgentInstance", back_populates="tasks")
    artifacts = relationship("Artifact", back_populates="task", cascade="all, delete-orphan")
    metrics = relationship("Metric", back_populates="task")
