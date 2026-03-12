from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.database import init_db
from routers import auth, entries, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Knowledge Threshold API",
    description="知识阈值 - Personal AI Knowledge Base",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sheesy.github.io",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/api/auth",    tags=["Auth"])
app.include_router(entries.router, prefix="/api/entries", tags=["Entries"])
app.include_router(search.router,  prefix="/api/search",  tags=["Search"])

@app.get("/")
def root():
    return {"message": "Knowledge Threshold API v1.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}
