from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.organization import Organization, PlanType
from app.models.agent import Agent
from app.schemas.billing import BillingStatus, PlanInfo

PLAN_LABELS = {
    "free":       "Gratuit",
    "starter":    "Starter",
    "pro":        "Pro",
    "enterprise": "Enterprise",
}

PLAN_DETAILS = [
    {
        "name": "free", "label": "Gratuit",
        "price_xof": 0, "price_eur": 0.0,
        "max_agents": 3, "retention_days": 30,
        "features": ["3 agents", "30 jours de retention", "Alertes email", "Dashboard temps reel"],
        "is_popular": False,
    },
    {
        "name": "starter", "label": "Starter",
        "price_xof": 10000, "price_eur": 15.0,
        "max_agents": 10, "retention_days": 90,
        "features": ["10 agents", "90 jours de retention", "Alertes SMS + Email", "Graphes historiques", "Support prioritaire"],
        "is_popular": True,
    },
    {
        "name": "pro", "label": "Pro",
        "price_xof": 25000, "price_eur": 38.0,
        "max_agents": 50, "retention_days": 365,
        "features": ["50 agents", "1 an de retention", "SMS + WhatsApp + Email", "API complete", "Support dedie"],
        "is_popular": False,
    },
]


def get_billing_status(org: Organization, db: Session) -> BillingStatus:
    now = datetime.utcnow()

    agents_used = db.query(func.count(Agent.id)).filter(
        Agent.organization_id == org.id,
        Agent.is_active == True,
    ).scalar() or 0

    trial_ends_at = org.trial_ends_at
    is_trial = trial_ends_at is not None
    trial_expired = False
    trial_days_remaining = None

    if trial_ends_at:
        delta = trial_ends_at - now
        trial_days_remaining = max(0, delta.days)
        trial_expired = delta.total_seconds() <= 0

    upgrade_urgency = "none"
    upgrade_message = None
    show_upgrade_banner = False

    if org.plan == PlanType.FREE:
        if trial_expired:
            upgrade_urgency = "critical"
            show_upgrade_banner = True
            upgrade_message = "Votre periode d essai est terminee. Passez au plan Starter pour continuer."
        elif trial_days_remaining is not None and trial_days_remaining <= 3:
            upgrade_urgency = "critical"
            show_upgrade_banner = True
            upgrade_message = f"Votre essai expire dans {trial_days_remaining} jour(s). Passez au Starter pour ne pas perdre vos donnees."
        elif trial_days_remaining is not None and trial_days_remaining <= 7:
            upgrade_urgency = "warning"
            show_upgrade_banner = True
            upgrade_message = f"Votre essai gratuit expire dans {trial_days_remaining} jours."
        elif agents_used >= org.max_agents:
            upgrade_urgency = "warning"
            show_upgrade_banner = True
            upgrade_message = "Limite d agents atteinte. Passez au Starter pour en ajouter d autres."

    return BillingStatus(
        plan=org.plan.value,
        plan_label=PLAN_LABELS.get(org.plan.value, org.plan.value),
        is_trial=is_trial,
        trial_ends_at=trial_ends_at,
        trial_days_remaining=trial_days_remaining,
        trial_expired=trial_expired,
        max_agents=org.max_agents,
        agents_used=agents_used,
        agents_remaining=max(0, org.max_agents - agents_used),
        show_upgrade_banner=show_upgrade_banner,
        upgrade_urgency=upgrade_urgency,
        upgrade_message=upgrade_message,
    )


def get_plan_list(current_plan: str) -> list[PlanInfo]:
    return [
        PlanInfo(**{**p, "is_current": p["name"] == current_plan})
        for p in PLAN_DETAILS
    ]
