from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class OrganizationStats(BaseModel):
    organization_id: str
    organization_name: str
    plan: str
    max_agents: int
    agents_total: int
    agents_online: int
    agents_offline: int
    agents_pending: int
    alerts_firing: int = 0
    alerts_critical: int = 0
    plan_usage_percent: float


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    max_agents: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
