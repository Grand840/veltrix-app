from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import get_db
from app.routers import auth as auth_router
from app.routers import agents as agents_router

app = FastAPI(
    title=settings.app_name,
    description="## Veltrix - Infrastructure Monitoring SaaS\n\n### Authentification\nEndpoints proteges : header `Authorization: Bearer <token>`\nEndpoints agent Go : header `X-Agent-Key: vltx_<cle>`",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix=settings.api_prefix)
app.include_router(agents_router.router, prefix=settings.api_prefix)


@app.get("/health", tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "service": "veltrix-api",
        "version": settings.app_version,
        "environment": settings.app_env,
        "components": {"api": "ok", "database": db_status},
    }


@app.get("/", tags=["System"])
async def root():
    return {"message": "Veltrix API is running", "docs": "/docs"}
