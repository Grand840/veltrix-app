from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class AgentCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Le nom doit contenir au moins 2 caracteres")
        if len(v) > 100:
            raise ValueError("Le nom ne peut pas depasser 100 caracteres")
        return v


class AgentUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_valid(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError("Le nom doit contenir au moins 2 caracteres")
        return v


class AgentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    hostname: Optional[str]
    os_info: Optional[str]
    ip_address: Optional[str]
    last_seen_at: Optional[datetime]
    is_active: bool
    organization_id: str
    created_at: datetime
    api_key: Optional[str] = None
    model_config = {"from_attributes": True}


class AgentListResponse(BaseModel):
    agents: list[AgentResponse]
    total: int
    page: int
    per_page: int


class AgentInstallCommand(BaseModel):
    agent_id: str
    install_command: str
    api_key: str
    note: str
