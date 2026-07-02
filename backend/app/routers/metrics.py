from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database import get_db
from app.middleware.auth import get_current_user, get_current_agent, get_current_org
from app.models.user import User
from app.models.agent import Agent
from app.models.organization import Organization
from app.schemas.metrics import (
    MetricPayload,
    MetricSeries,
    AgentMetricsSummary,
    MetricsReceiveResponse,
)
from app.services.metrics import (
    write_metrics,
    query_range,
    get_agent_summary,
)
from app.services.agents import (
    update_agent_heartbeat,
    get_agent_by_id,
    get_agents,
)
from app.services.alerts import check_and_create_alerts

router = APIRouter(prefix="/metrics", tags=["Metrics"])

VALID_METRICS = [
    "veltrix_cpu_pct",
    "veltrix_cpu_load_1",
    "veltrix_cpu_load_5",
    "veltrix_cpu_load_15",
    "veltrix_mem_used_pct",
    "veltrix_mem_used_gb",
    "veltrix_mem_total_gb",
    "veltrix_disk_used_pct",
    "veltrix_disk_used_gb",
    "veltrix_disk_total_gb",
    "veltrix_network_bytes_sent",
    "veltrix_network_bytes_recv",
    "veltrix_network_bytes_sent_per_sec",
    "veltrix_network_bytes_recv_per_sec",
    "veltrix_uptime_seconds",
]


@router.post(
    "/ingest",
    response_model=MetricsReceiveResponse,
    summary="Ingerer des metriques (agent Go)",
)
async def ingest_metrics(
    payload: MetricPayload,
    agent: Agent = Depends(get_current_agent),
    db: Session = Depends(get_db),
):
    update_agent_heartbeat(
        agent=agent,
        hostname=payload.hostname,
        os_info="",
        ip_address="",
        db=db,
    )

    check_and_create_alerts(
        agent=agent,
        cpu=payload.cpu_pct,
        memory=payload.mem_used_pct,
        disk=payload.disk_used_pct,
        db=db,
    )

    success = await write_metrics(
        agent_id=str(agent.id),
        org_id=str(agent.organization_id),
        payload=payload,
    )

    now_str = datetime.now(tz=timezone.utc).isoformat()

    if not success:
        return MetricsReceiveResponse(
            success=False,
            message="Metriques recues mais stockage temporairement indisponible",
            agent_id=str(agent.id),
            timestamp=now_str,
        )

    return MetricsReceiveResponse(
        success=True,
        message="Metriques ingerees avec succes",
        agent_id=str(agent.id),
        timestamp=now_str,
    )


@router.get(
    "/agents/{agent_id}/summary",
    response_model=AgentMetricsSummary,
    summary="Resume des metriques d un agent",
)
async def agent_summary(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    agent = get_agent_by_id(agent_id, str(org.id), db)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent introuvable"
        )

    summary = await get_agent_summary(
        agent_id=str(agent.id),
        hostname=agent.hostname or agent.name,
        status=agent.status.value,
        last_seen_at=agent.last_seen_at,
    )
    return summary


@router.get(
    "/agents/{agent_id}/history/{metric_name}",
    response_model=MetricSeries,
    summary="Historique d une metrique",
)
async def agent_metric_history(
    agent_id: str,
    metric_name: str,
    start: str = Query(default="1h", description="Debut: 1h, 24h, 7d"),
    step: str = Query(default="30s", description="Resolution: 30s, 1m, 5m"),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    if metric_name not in VALID_METRICS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Metrique invalide. Valeurs acceptees : {VALID_METRICS}"
        )

    agent = get_agent_by_id(agent_id, str(org.id), db)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent introuvable"
        )

    points = await query_range(
        metric_name=metric_name,
        agent_id=agent_id,
        start=start,
        step=step,
    )

    return MetricSeries(
        metric_name=metric_name,
        agent_id=agent_id,
        hostname=agent.hostname or agent.name,
        points=points,
    )


@router.get(
    "/overview",
    response_model=list[AgentMetricsSummary],
    summary="Vue d ensemble de tous les agents",
)
async def metrics_overview(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    agents, _ = get_agents(str(org.id), db, page=1, per_page=50)

    summaries = []
    for agent in agents:
        summary = await get_agent_summary(
            agent_id=str(agent.id),
            hostname=agent.hostname or agent.name,
            status=agent.status.value,
            last_seen_at=agent.last_seen_at,
        )
        summaries.append(summary)

    return summaries