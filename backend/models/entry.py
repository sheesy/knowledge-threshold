from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum, ForeignKey, Integer
from sqlalchemy.orm import relationship
from core.database import Base
from datetime import datetime
import uuid
import enum

class ContentType(str, enum.Enum):
    doc    = "doc"
    code   = "code"
    qa     = "qa"
    link   = "link"
    image  = "image"

class SourceType(str, enum.Enum):
    original      = "original"
    curated       = "curated"
    ai_generated  = "ai_generated"

class Visibility(str, enum.Enum):
    private = "private"
    public  = "public"

class Entry(Base):
    __tablename__ = "entries"

    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id      = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title        = Column(String(256), nullable=False)
    content_type = Column(SAEnum(ContentType), nullable=False, default=ContentType.doc)
    content_body = Column(Text, nullable=True)
    source_type  = Column(SAEnum(SourceType), default=SourceType.original)
    source_url   = Column(Text, nullable=True)
    visibility   = Column(SAEnum(Visibility), default=Visibility.private)
    domain_tags  = Column(Text, default="")   # comma-separated, easy for SQLite
    scene_tags   = Column(Text, default="")
    version      = Column(Integer, default=1)
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="entries")
