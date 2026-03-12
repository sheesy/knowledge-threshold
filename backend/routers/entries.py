from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from core.database import get_db
from core.security import get_current_user
from models.entry import Entry, ContentType, SourceType, Visibility
from models.user import User
from datetime import datetime

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────────

class EntryCreate(BaseModel):
    title: str
    content_type: ContentType = ContentType.doc
    content_body: Optional[str] = None
    source_type: SourceType = SourceType.original
    source_url: Optional[str] = None
    visibility: Visibility = Visibility.private
    domain_tags: List[str] = []
    scene_tags: List[str] = []

class EntryUpdate(BaseModel):
    title: Optional[str] = None
    content_body: Optional[str] = None
    source_type: Optional[SourceType] = None
    source_url: Optional[str] = None
    visibility: Optional[Visibility] = None
    domain_tags: Optional[List[str]] = None
    scene_tags: Optional[List[str]] = None

class EntryOut(BaseModel):
    id: str
    user_id: str
    title: str
    content_type: str
    content_body: Optional[str]
    source_type: str
    source_url: Optional[str]
    visibility: str
    domain_tags: List[str]
    scene_tags: List[str]
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        data = {
            "id": obj.id,
            "user_id": obj.user_id,
            "title": obj.title,
            "content_type": obj.content_type,
            "content_body": obj.content_body,
            "source_type": obj.source_type,
            "source_url": obj.source_url,
            "visibility": obj.visibility,
            "domain_tags": [t for t in obj.domain_tags.split(",") if t] if obj.domain_tags else [],
            "scene_tags": [t for t in obj.scene_tags.split(",") if t] if obj.scene_tags else [],
            "version": obj.version,
            "created_at": obj.created_at,
            "updated_at": obj.updated_at,
        }
        return cls(**data)

# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_entry_or_404(entry_id: str, user: User, db: Session) -> Entry:
    entry = db.query(Entry).filter(Entry.id == entry_id, Entry.user_id == user.id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/", response_model=EntryOut, status_code=201)
def create_entry(
    body: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = Entry(
        user_id=current_user.id,
        title=body.title,
        content_type=body.content_type,
        content_body=body.content_body,
        source_type=body.source_type,
        source_url=body.source_url,
        visibility=body.visibility,
        domain_tags=",".join(body.domain_tags),
        scene_tags=",".join(body.scene_tags),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return EntryOut.from_orm(entry)


@router.get("/", response_model=List[EntryOut])
def list_entries(
    content_type: Optional[str] = Query(None),
    visibility: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    q = db.query(Entry).filter(Entry.user_id == current_user.id)
    if content_type:
        q = q.filter(Entry.content_type == content_type)
    if visibility:
        q = q.filter(Entry.visibility == visibility)
    if tag:
        q = q.filter(Entry.domain_tags.contains(tag) | Entry.scene_tags.contains(tag))
    entries = q.order_by(Entry.updated_at.desc()).offset(skip).limit(limit).all()
    return [EntryOut.from_orm(e) for e in entries]


@router.get("/public", response_model=List[EntryOut])
def list_public_entries(
    skip: int = 0, limit: int = 50,
    db: Session = Depends(get_db)
):
    entries = db.query(Entry).filter(Entry.visibility == Visibility.public)\
        .order_by(Entry.updated_at.desc()).offset(skip).limit(limit).all()
    return [EntryOut.from_orm(e) for e in entries]


@router.get("/{entry_id}", response_model=EntryOut)
def get_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return EntryOut.from_orm(_get_entry_or_404(entry_id, current_user, db))


@router.put("/{entry_id}", response_model=EntryOut)
def update_entry(
    entry_id: str,
    body: EntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = _get_entry_or_404(entry_id, current_user, db)
    if body.title is not None:         entry.title = body.title
    if body.content_body is not None:  entry.content_body = body.content_body
    if body.source_type is not None:   entry.source_type = body.source_type
    if body.source_url is not None:    entry.source_url = body.source_url
    if body.visibility is not None:    entry.visibility = body.visibility
    if body.domain_tags is not None:   entry.domain_tags = ",".join(body.domain_tags)
    if body.scene_tags is not None:    entry.scene_tags = ",".join(body.scene_tags)
    entry.version += 1
    entry.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)
    return EntryOut.from_orm(entry)


@router.delete("/{entry_id}", status_code=204)
def delete_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = _get_entry_or_404(entry_id, current_user, db)
    db.delete(entry)
    db.commit()
