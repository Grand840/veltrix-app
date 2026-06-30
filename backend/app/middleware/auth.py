from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.models.agent import Agent
from app.services.auth import decode_access_token

bearer_scheme = HTTPBearer()
agent_key_header = APIKeyHeader(name="X-Agent-Key", auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expire",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        raise credentials_exception

    return user


def get_current_org(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Organization:
    org = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    if org is None or not org.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organisation introuvable ou suspendue"
        )
    return org


def get_current_agent(
    api_key: Optional[str] = Depends(agent_key_header),
    db: Session = Depends(get_db),
) -> Agent:
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cle API manquante. Header requis : X-Agent-Key",
        )

    from app.services.agents import get_agent_by_api_key
    agent = get_agent_by_api_key(api_key, db)

    if not agent:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cle API invalide ou agent desactive",
        )

    return agent
