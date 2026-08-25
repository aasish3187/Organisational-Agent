from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class Metric(Base):
    __tablename__ = "metrics"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("met"))
    run_id: Mapped[str | None] = mapped_column(String, ForeignKey("runs.id"), nullable=True)
    agent_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("agent_instances.id"), nullable=True
    )
    task_id: Mapped[str | None] = mapped_column(String, ForeignKey("tasks.id"), nullable=True)
    tokens_in: Mapped[int] = mapped_column(Integer, default=0)
    tokens_out: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cost_usd: Mapped[Decimal | None] = mapped_column(Numeric(10, 6), default=Decimal("0.000000"))
    tool_calls: Mapped[int] = mapped_column(Integer, default=0)
    outcome: Mapped[str | None] = mapped_column(String, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    run = relationship("Run", back_populates="metrics")
    agent = relationship("AgentInstance", back_populates="metrics")
    task = relationship("Task", back_populates="metrics")
