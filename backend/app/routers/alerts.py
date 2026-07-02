from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.middleware.auth import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.models.agent import Agent
from app.schemas.alerts import AlertResponse, AlertListResponse, AlertAckRequest
from app.schemas.errors import NotFoundError, BadRequestError
from app.services.alerts import get_alerts, acknowledge_alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])

VALID_STATUSES = ["firing", "acknowledged", "resolved"]
VALID_SEVERITIES = ["info", "warning", "critical"]


@router.get(
    "",
    response_model=AlertListResponse,
    summary="Lister les alertes",
)
def list_alerts(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(default=None, description="firing | acknowledged | resolved"),
    severity: Optional[str] = Query(default=None, description="info | warning | critical"),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    if status and status not in VALID_STATUSES:
        raise BadRequestError(
            f"Statut invalide. Valeurs : {', '.join(VALID_STATUSES)}",
            error="INVALID_ALERT_STATUS",
        )
    if severity and severity not in VALID_SEVERITIES:
        raise BadRequestError(
            f"Severite invalide. Valeurs : {', '.join(VALID_SEVERITIES)}",
            error="INVALID_ALERT_SEVERITY",
        )

    rows, total, total_critical, total_firing = get_alerts(
        str(org.id), db, page, per_page, status, severity
    )

    alerts = []
    for row in rows:
        alert = row["alert"]
        alerts.append(AlertResponse(
            id=str(alert.id),
            title=alert.title,
            message=alert.message,
            metric=alert.metric.value,
            severity=alert.severity.value,
            status=alert.status.value,
            threshold_value=alert.threshold_value,
            current_value=alert.current_value,
            fired_at=alert.fired_at,
            resolved_at=alert.resolved_at,
            acknowledged_at=alert.acknowledged_at,
            sms_sent=alert.sms_sent,
            email_sent=alert.email_sent,
            agent_id=str(alert.agent_id),
            agent_name=row["agent_name"],
        ))

    return AlertListResponse(
        alerts=alerts,
        total=total,
        total_critical=total_critical,
        total_firing=total_firing,
        page=page,
        per_page=per_page,
    )


@router.post(
    "/{alert_id}/acknowledge",
    response_model=AlertResponse,
    summary="Acquitter une alerte",
)
def ack_alert(
    alert_id: str,
    data: AlertAckRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    alert = acknowledge_alert(
        alert_id=alert_id,
        organization_id=str(org.id),
        user_id=str(current_user.id),
        db=db,
        comment=data.comment,
    )
    if not alert:
        raise NotFoundError("Alerte", error="ALERT_NOT_FOUND")

    agent = db.query(Agent).filter(Agent.id == alert.agent_id).first()
    return AlertResponse(
        id=str(alert.id),
        title=alert.title,
        message=alert.message,
        metric=alert.metric.value,
        severity=alert.severity.value,
        status=alert.status.value,
        threshold_value=alert.threshold_value,
        current_value=alert.current_value,
        fired_at=alert.fired_at,
        resolved_at=alert.resolved_at,
        acknowledged_at=alert.acknowledged_at,
        sms_sent=alert.sms_sent,
        email_sent=alert.email_sent,
        agent_id=str(alert.agent_id),
        agent_name=agent.name if agent else "unknown",
        acknowledged_by_email=current_user.email,
    )

