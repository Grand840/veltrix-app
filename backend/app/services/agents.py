import secrets
import string
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.agent import Agent, AgentStatus
from app.models.organization import Organization
from app.schemas.agent import AgentCreateRequest, AgentUpdateRequest


def generate_api_key() -> str:
    alphabet = string.ascii_letters + string.digits
    random_part = "".join(secrets.choice(alphabet) for _ in range(40))
    return f"vltx_{random_part}"


def create_agent(
    data: AgentCreateRequest,
    organization_id: str,
    db: Session,
) -> tuple[Agent, str]:
    org = db.query(Organization).filter(
        Organization.id == organization_id
    ).first()

    if not org:
        raise ValueError("Organisation introuvable")

    active_count = db.query(func.count(Agent.id)).filter(
        Agent.organization_id == organization_id,
        Agent.is_active == True,
    ).scalar()

    if active_count >= org.max_agents:
        raise ValueError(
            f"Limite atteinte : votre plan {org.plan.value} autorise "
            f"{org.max_agents} agent(s). Vous en avez {active_count}. "
            f"Passez au plan superieur pour en ajouter d autres."
        )

    api_key = generate_api_key()
    while db.query(Agent).filter(Agent.api_key == api_key).first():
        api_key = generate_api_key()

    agent = Agent(
        name=data.name,
        description=data.description,
        api_key=api_key,
        status=AgentStatus.PENDING,
        is_active=True,
        organization_id=organization_id,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)

    return agent, api_key


def get_agents(
    organization_id: str,
    db: Session,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[Agent], int]:
    query = db.query(Agent).filter(
        Agent.organization_id == organization_id,
        Agent.is_active == True,
    )

    total = query.count()
    agents = (
        query
        .order_by(Agent.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return agents, total


def get_agent_by_id(
    agent_id: str,
    organization_id: str,
    db: Session,
) -> Optional[Agent]:
    return db.query(Agent).filter(
        Agent.id == agent_id,
        Agent.organization_id == organization_id,
        Agent.is_active == True,
    ).first()


def get_agent_by_api_key(api_key: str, db: Session) -> Optional[Agent]:
    return db.query(Agent).filter(
        Agent.api_key == api_key,
        Agent.is_active == True,
    ).first()


def update_agent(
    agent_id: str,
    organization_id: str,
    data: AgentUpdateRequest,
    db: Session,
) -> Optional[Agent]:
    agent = get_agent_by_id(agent_id, organization_id, db)
    if not agent:
        return None

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(agent, field, value)

    agent.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(agent)
    return agent


def delete_agent(
    agent_id: str,
    organization_id: str,
    db: Session,
) -> bool:
    agent = get_agent_by_id(agent_id, organization_id, db)
    if not agent:
        return False

    agent.is_active = False
    agent.updated_at = datetime.utcnow()
    db.commit()
    return True


def update_agent_heartbeat(
    agent: Agent,
    hostname: str,
    os_info: str,
    ip_address: str,
    db: Session,
) -> Agent:
    agent.last_seen_at = datetime.utcnow()
    agent.hostname = hostname
    agent.os_info = os_info
    agent.ip_address = ip_address
    agent.status = AgentStatus.ONLINE
    agent.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(agent)
    return agent
