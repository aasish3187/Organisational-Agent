from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.nanoid import new_id


class Claim(Base):
    __tablename__ = "claims"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: new_id("clm"))
    artifact_id: Mapped[str] = mapped_column(
        String, ForeignKey("artifacts.id", ondelete="CASCADE"), nullable=False
    )
    statement: Mapped[str] = mapped_column(Text, nullable=False)
    support_status: Mapped[str] = mapped_column(
        String, default="unsupported"
    )  # supported|unsupported|disputed
    evidence_ids: Mapped[list[str] | None] = mapped_column(JSON, default=list)

    artifact = relationship("Artifact", back_populates="claims")
