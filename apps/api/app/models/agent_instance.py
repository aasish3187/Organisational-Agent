from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class AgentInstance(Base):
    __tablename__ = "agent_instances"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("agt"))
    run_id: Mapped[str] = mapped_column(String, ForeignKey("runs.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)
    parent_id: Mapped[str | None] = mapped_column(String, ForeignKey("agent_instances.id"), nullable=True)
    mandate: Mapped[str | None] = mapped_column(Text, nullable=True)
    permitted_tools: Mapped[list[str] | None] = mapped_column(JSON, default=list)
    model_tier: Mapped[str] = mapped_column(String, default="reasoning")  # fast|reasoning|local|qwen
    status: Mapped[str] = mapped_column(String, default="PENDING")  # PENDING|ACTIVE|COMPLETED|FAILED
    token_budget: Mapped[int] = mapped_column(Integer, default=5000)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    run = relationship("Run", back_populates="agent_instances")
    parent = relationship("AgentInstance", remote_side=[id], backref="children")
    tasks = relationship("Task", back_populates="owner_agent")
    metrics = relationship("Metric", back_populates="agent")
