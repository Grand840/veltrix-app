from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.schemas.organization import OrganizationStats, OrganizationResponse
from app.services.organization import get_organization_stats

router = APIRouter(prefix="/organizations", tags=["Organization"])


@router.get(
    "/me",
    response_model=OrganizationResponse,
    summary="Mon organisation",
)
def get_my_organization(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
):
    return OrganizationResponse(
        id=str(org.id),
        name=org.name,
        slug=org.slug,
        plan=org.plan.value,
        max_agents=org.max_agents,
        is_active=org.is_active,
        created_at=org.created_at,
    )


@router.get(
    "/me/stats",
    response_model=OrganizationStats,
    summary="Statistiques de mon organisation",
)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    return get_organization_stats(org, db)
