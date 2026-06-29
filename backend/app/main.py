"""
Veltrix API — Point d'entrée principal
Version Jour 02 : connexion base de données intégrée
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import get_db, engine, Base

# Création de l'application FastAPI
app = FastAPI(
    title=settings.app_name,
    description="Infrastructure Monitoring SaaS — Backend API",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    """
    Vérifie que l'API ET la base de données sont en ligne.
    Retourne le statut de chaque composant séparément.
    """
    # Test connexion PostgreSQL
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
        "components": {
            "api": "ok",
            "database": db_status,
        }
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Veltrix API is running",
        "docs": "/docs",
        "version": settings.app_version,
    }