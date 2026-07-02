from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.agent import Agent, AgentStatus
from app.models.organization import Organization
from app.schemas.organization import OrganizationStats


def get_organization_stats(
    org: Organization,
    db: Session,
) -> OrganizationStats:
    org_id = str(org.id)

    status_counts = dict(
        db.query(Agent.status, func.count(Agent.id))
        .filter(
            Agent.organization_id == org.id,
            Agent.is_active == True,
        )
        .group_by(Agent.status)
        .all()
    )

    agents_online  = status_counts.get(AgentStatus.ONLINE, 0)
    agents_offline = status_counts.get(AgentStatus.OFFLINE, 0)
    agents_pending = status_counts.get(AgentStatus.PENDING, 0)
    agents_total   = agents_online + agents_offline + agents_pending

    plan_usage = (agents_total / org.max_agents * 100) if org.max_agents > 0 else 0

    return OrganizationStats(
        organization_id=org_id,
        organization_name=org.name,
        plan=org.plan.value,
        max_agents=org.max_agents,
        agents_total=agents_total,
        agents_online=agents_online,
        agents_offline=agents_offline,
        agents_pending=agents_pending,
        alerts_firing=0,
        alerts_critical=0,
        plan_usage_percent=round(plan_usage, 1),
    )
