from sqlalchemy import Column, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid
import enum

class PlanType(str, enum.Enum):
    free = "free"
    pro = "pro"

class User(Base):
    __tablename__ = "users"

    id            = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username      = Column(String(64), unique=True, nullable=False, index=True)
    email         = Column(String(128), unique=True, nullable=False, index=True)
    password_hash = Column(String(256), nullable=False)
    plan          = Column(SAEnum(PlanType), default=PlanType.free)
    created_at    = Column(DateTime, default=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    entries = relationship("Entry", back_populates="user", cascade="all, delete-orphan")
