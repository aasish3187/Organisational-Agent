from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class Run(Base):
    __tablename__ = "runs"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("run"))
    project_id: Mapped[str] = mapped_column(
        String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    mode: Mapped[str] = mapped_column(
        String, default="BALANCED", nullable=False
    )  # FAST|BALANCED|DEEP
    status: Mapped[str] = mapped_column(String, default="INITIALIZING", nullable=False)
    # INITIALIZING|COMPILING|RUNNING|WAITING_FOR_HUMAN|COMPLETED|FAILED|CANCELLED|BUDGET_EXCEEDED
    model_policy: Mapped[str] = mapped_column(String, default="AUTO")  # STRICT|BALANCE|NOCAP|AUTO
    budget_max_tokens: Mapped[int] = mapped_column(Integer, default=30000)
    budget_max_cost_usd: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("2.0000"))
    budget_max_minutes: Mapped[int] = mapped_column(Integer, default=10)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    cost_usd: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=Decimal("0.0000"))
    is_demo_replay: Mapped[bool] = mapped_column(Boolean, default=False)
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="runs")
    agent_instances = relationship(
        "AgentInstance", back_populates="run", cascade="all, delete-orphan"
    )
    tasks = relationship("Task", back_populates="run", cascade="all, delete-orphan")
    events = relationship(
        "Event", back_populates="run", cascade="all, delete-orphan", order_by="Event.sequence"
    )
    approvals = relationship("Approval", back_populates="run", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="run")
    metrics = relationship("Metric", back_populates="run")
    process_atoms = relationship("ProcessAtom", back_populates="source_run")
