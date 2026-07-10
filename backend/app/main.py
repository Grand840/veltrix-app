import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import get_db
from app.routers import auth as auth_router
from app.routers import agents as agents_router
from app.routers import metrics as metrics_router
from app.routers import organization as org_router
from app.routers import alerts as alerts_router
from app.routers import billing as billing_router
from app.schemas.errors import VeltrixError, ErrorResponse
from app.services.offline_detector import offline_detector_loop

logger = logging.getLogger(__name__)


desc = (
    "## Veltrix - Infrastructure Monitoring SaaS\n\n"
    "### Auth utilisateur\n"
    "Header : `Authorization: Bearer <jwt_token>`\n\n"
    "### Auth agent Go\n"
    "Header : `X-Agent-Key: vltx_<api_key>`\n\n"
    "### Format des erreurs\n"
    "```json\n"
    "{\n"
    '  "error": "AGENT_NOT_FOUND",\n'
    '  "message": "Agent introuvable",\n'
    '  "detail": null,\n'
    '  "status_code": 404\n'
    "}\n"
    '```'
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Demarrage de l'API Veltrix...")
    offline_task = asyncio.create_task(offline_detector_loop())
    logger.info("Job offline-detector demarre")
    yield
    offline_task.cancel()
    try:
        await offline_task
    except asyncio.CancelledError:
        pass
    logger.info("API Veltrix arretee proprement")


app = FastAPI(
    title=settings.app_name,
    description=desc,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


@app.exception_handler(VeltrixError)
async def veltrix_exception_handler(request: Request, exc: VeltrixError):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.error,
            message=exc.veltrix_message,
            detail=exc.veltrix_detail,
            status_code=exc.status_code,
        ).model_dump(),
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost","http://localhost:3000", "http://10.0.40.20:3000", "https://veltrix.ddns.net"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router,    prefix=settings.api_prefix)
app.include_router(agents_router.router,  prefix=settings.api_prefix)
app.include_router(metrics_router.router, prefix=settings.api_prefix)
app.include_router(org_router.router,     prefix=settings.api_prefix)
app.include_router(alerts_router.router,  prefix=settings.api_prefix)
app.include_router(billing_router.router, prefix=settings.api_prefix)


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

