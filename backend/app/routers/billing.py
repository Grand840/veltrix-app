from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.schemas.billing import BillingStatus, PlanInfo
from app.services.billing import get_billing_status, get_plan_list

router = APIRouter(prefix="/billing", tags=["Billing"])


@router.get(
    "/status",
    response_model=BillingStatus,
    summary="Statut billing de l organisation",
)
def billing_status(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    return get_billing_status(org, db)


@router.get(
    "/plans",
    response_model=list[PlanInfo],
    summary="Liste des plans disponibles",
)
def list_plans(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
):
    return get_plan_list(org.plan.value)
