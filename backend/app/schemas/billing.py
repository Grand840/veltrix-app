from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BillingStatus(BaseModel):
    plan: str
    plan_label: str
    is_trial: bool
    trial_ends_at: Optional[datetime]
    trial_days_remaining: Optional[int]
    trial_expired: bool
    max_agents: int
    agents_used: int
    agents_remaining: int
    show_upgrade_banner: bool
    upgrade_urgency: str
    upgrade_message: Optional[str]


class PlanInfo(BaseModel):
    name: str
    label: str
    price_xof: int
    price_eur: float
    max_agents: int
    retention_days: int
    features: list[str]
    is_current: bool
    is_popular: bool
