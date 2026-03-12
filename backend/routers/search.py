from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.security import get_current_user
from models.entry import Entry, Visibility
from models.user import User
from routers.entries import EntryOut

router = APIRouter()

@router.get("/", response_model=List[EntryOut])
def search(
    q: str = Query(..., min_length=1, description="Search query"),
    scope: str = Query("mine", description="'mine' or 'public'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Keyword search across title, content_body, domain_tags, scene_tags.
    Phase 1: simple SQL LIKE. Phase 2: replace with vector search.
    """
    query = db.query(Entry)

    if scope == "public":
        query = query.filter(Entry.visibility == Visibility.public)
    else:
        query = query.filter(Entry.user_id == current_user.id)

    term = f"%{q}%"
    query = query.filter(
        Entry.title.ilike(term) |
        Entry.content_body.ilike(term) |
        Entry.domain_tags.ilike(term) |
        Entry.scene_tags.ilike(term)
    )

    entries = query.order_by(Entry.updated_at.desc()).limit(30).all()
    return [EntryOut.from_orm(e) for e in entries]
