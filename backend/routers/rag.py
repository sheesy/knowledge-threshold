from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from openai import OpenAI
from core.database import get_db
from core.security import get_current_user
from models.entry import Entry
from models.user import User
import os

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

class RAGRequest(BaseModel):
    question: str

class RAGResponse(BaseModel):
    answer: str
    sources: list[str]

@router.post("/ask", response_model=RAGResponse)
def ask(
    body: RAGRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="问题不能为空")

    # 从用户知识库里搜索相关条目
    term = f"%{body.question}%"
    entries = db.query(Entry).filter(
        Entry.user_id == current_user.id,
        (Entry.title.ilike(term) |
         Entry.content_body.ilike(term) |
         Entry.domain_tags.ilike(term))
    ).limit(5).all()

    if not entries:
        return RAGResponse(
            answer="在你的知识库中没有找到与问题相关的内容，请先添加相关知识条目。",
            sources=[]
        )

    # 构建上下文
    context = "\n\n".join([
        f"【{e.title}】\n{e.content_body or ''}"
        for e in entries
    ])

    prompt = f"""你是一个知识库助手。请根据以下知识库内容回答用户的问题。
只根据提供的知识库内容作答，如果知识库中没有相关信息，请如实说明。

知识库内容：
{context}

用户问题：{body.question}

请用中文回答："""

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
    )

    answer = response.choices[0].message.content
    sources = [e.title for e in entries]

    return RAGResponse(answer=answer, sources=sources)
