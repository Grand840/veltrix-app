from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
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
    status_code=status.HTTP_201_CREATED,
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    install_cmd_dev = (
        f"VELTRIX_KEY={api_key} "
        f"VELTRIX_URL=http://localhost:8000 "
        f"./agent/veltrix-agent"
    )

    return AgentInstallCommand(
        agent_id=str(agent.id),
        install_command=install_cmd_dev,
        api_key=api_key,
        note=(
            "Sauvegardez cette cle API maintenant. "
            "Elle ne sera plus affichee apres cette page."
        ),
    )


@router.get(
    "",
    response_model=AgentListResponse,
    summary="Lister les agents",
)
def list_agents(
    page: int = Query(default=1, ge=1, description="Numero de page"),
    per_page: int = Query(default=20, ge=1, le=100, description="Agents par page"),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    agents, total = get_agents(str(org.id), db, page, per_page)

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


@router.get(
    "/{agent_id}",
    response_model=AgentResponse,
    summary="Detail d un agent",
)
def get_agent(
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


@router.patch(
    "/{agent_id}",
    response_model=AgentResponse,
    summary="Modifier un agent",
)
def update(
    agent_id: str,
    data: AgentUpdateRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    agent = update_agent(agent_id, str(org.id), data, db)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent introuvable"
        )

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


@router.delete(
    "/{agent_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer un agent",
)
def delete(
    agent_id: str,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db),
):
    deleted = delete_agent(agent_id, str(org.id), db)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent introuvable"
        )
