"""
Veltrix API — Point d'entrée principal
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Création de l'application FastAPI
app = FastAPI(
    title="Veltrix API",
    description="Infrastructure Monitoring SaaS — Backend API",
    version="0.1.0",
    docs_url="/docs",        # Swagger UI accessible à /docs
    redoc_url="/redoc",      # ReDoc accessible à /redoc
)

# CORS : autorise le frontend (localhost:3000) à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["System"])
async def health_check():
    """
    Vérifie que l'API est en ligne.
    Utilisé par Docker healthcheck et les load balancers.
    """
    return {
        "status": "ok",
        "service": "veltrix-api",
        "version": "0.1.0"
    }


@app.get("/", tags=["System"])
async def root():
    """Point d'entrée racine."""
    return {
        "message": "Veltrix API is running",
        "docs": "/docs"
    }
