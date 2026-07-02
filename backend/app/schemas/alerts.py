from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertResponse(BaseModel):
    id: str
    title: str
    message: Optional[str]
    metric: str
    severity: str
    status: str
    threshold_value: Optional[float]
    current_value: Optional[float]
    fired_at: Optional[datetime]
    resolved_at: Optional[datetime]
    acknowledged_at: Optional[datetime]
    sms_sent: bool
    email_sent: bool
    agent_id: str
    agent_name: str
    acknowledged_by_email: Optional[str] = None

    model_config = {"from_attributes": True}


class AlertListResponse(BaseModel):
    alerts: list[AlertResponse]
    total: int
    total_critical: int
    total_firing: int
    page: int
    per_page: int


class AlertAckRequest(BaseModel):
    comment: Optional[str] = None

