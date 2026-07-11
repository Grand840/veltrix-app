from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.config import settings
from app.middleware.auth import get_current_user, get_current_org
from app.models.user import User
from app.models.organization import Organization
from app.schemas.agent import (
    AgentCreateRequest,
    AgentUpdateRequest,
    AgentResponse,
    AgentListResponse,
    AgentInstallCommand,
)
from app.schemas.errors import NotFoundError, BadRequestError
from app.services.agents import (
    create_agent,
    get_agents,
    get_agent_by_id,
    update_agent,
    delete_agent,
)

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post(
    "",
    response_model=AgentInstallCommand,
    status_code=201,
    summary="Creer un agent",
)
def create(
    data: AgentCreateRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    try:
        agent, api_key = create_agent(data, str(org.id), db)
    except ValueError as e:
        raise BadRequestError(str(e), error="AGENT_LIMIT_REACHED")

    base_url = settings.veltrix_base_url
    install_cmd = (
        f"curl -fsSL {base_url}/downloads/install.sh | "
        f"sudo VELTRIX_KEY={api_key} bash"
    )

    return AgentInstallCommand(
        agent_id=str(agent.id),
        install_command=install_cmd,
        api_key=api_key,
        note="Sauvegardez cette cle API maintenant. Elle ne sera plus affichee.",
    )


@router.get(
    "",
    response_model=AgentListResponse,
    summary="Lister les agents",
)
def list_agents(
    page: int = Query(default=1, ge=1),
    per_page: int = Query(default=20, ge=1, le=100),
    status: Optional[str] = Query(
        default=None,
        description="Filtrer par statut : online, offline, pending, disabled"
    ),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    valid_statuses = ["online", "offline", "pending", "disabled"]
    if status and status not in valid_statuses:
        raise BadRequestError(
            "Statut invalide. Valeurs acceptees : " + ", ".join(valid_statuses),
            error="INVALID_STATUS_FILTER",
        )

    agents, total = get_agents(
        str(org.id), db, page, per_page,
        status_filter=status,
    )

    return AgentListResponse(
        agents=[
            AgentResponse(
                id=str(a.id),
                name=a.name,
                description=a.description,
                status=a.status.value,
                hostname=a.hostname,
                os_info=a.os_info,
                ip_address=a.ip_address,
                last_seen_at=a.last_seen_at,
                is_active=a.is_active,
                organization_id=str(a.organization_id),
                created_at=a.created_at,
                api_key=None,
            )
            for a in agents
        ],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{agent_id}", response_model=AgentResponse, summary="Detail d un agent")
def get_agent(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    agent = get_agent_by_id(agent_id, str(org.id), db)
    if not agent:
        raise NotFoundError("Agent")

    return AgentResponse(
        id=str(agent.id),
        name=agent.name,
        description=agent.description,
        status=agent.status.value,
        hostname=agent.hostname,
        os_info=agent.os_info,
        ip_address=agent.ip_address,
        last_seen_at=agent.last_seen_at,
        is_active=agent.is_active,
        organization_id=str(agent.organization_id),
        created_at=agent.created_at,
        api_key=None,
    )


@router.patch("/{agent_id}", response_model=AgentResponse, summary="Modifier un agent")
def update(
    agent_id: str,
    data: AgentUpdateRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    agent = update_agent(agent_id, str(org.id), data, db)
    if not agent:
        raise NotFoundError("Agent")

    return AgentResponse(
        id=str(agent.id),
        name=agent.name,
        description=agent.description,
        status=agent.status.value,
        hostname=agent.hostname,
        os_info=agent.os_info,
        ip_address=agent.ip_address,
        last_seen_at=agent.last_seen_at,
        is_active=agent.is_active,
        organization_id=str(agent.organization_id),
        created_at=agent.created_at,
        api_key=None,
    )


@router.delete("/{agent_id}", status_code=204, summary="Supprimer un agent")
def delete(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    deleted = delete_agent(agent_id, str(org.id), db)
    if not deleted:
        raise NotFoundError("Agent")
