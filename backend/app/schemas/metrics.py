from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime


class MetricPayload(BaseModel):
    hostname: str
    os_info: Optional[str] = None
    ip_address: Optional[str] = None

    cpu_usage_percent: float = Field(ge=0.0, le=100.0)
    memory_usage_percent: float = Field(ge=0.0, le=100.0)
    memory_used_mb: float = Field(ge=0.0)
    memory_total_mb: float = Field(ge=0.0)
    disk_usage_percent: float = Field(ge=0.0, le=100.0)
    disk_used_gb: float = Field(ge=0.0)
    disk_total_gb: float = Field(ge=0.0)
    network_bytes_sent: Optional[float] = Field(default=0.0, ge=0.0)
    network_bytes_recv: Optional[float] = Field(default=0.0, ge=0.0)
    timestamp: Optional[datetime] = None

    @field_validator("hostname")
    @classmethod
    def hostname_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("hostname ne peut pas etre vide")
        return v.strip()


class MetricPoint(BaseModel):
    timestamp: datetime
    value: float


class MetricSeries(BaseModel):
    metric_name: str
    agent_id: str
    hostname: str
    points: list[MetricPoint]


class AgentMetricsSummary(BaseModel):
    agent_id: str
    hostname: str
    status: str
    last_seen_at: Optional[datetime]
    cpu_usage_percent: Optional[float] = None
    memory_usage_percent: Optional[float] = None
    disk_usage_percent: Optional[float] = None
    cpu_health: str = "unknown"
    memory_health: str = "unknown"
    disk_health: str = "unknown"


class MetricsReceiveResponse(BaseModel):
    success: bool
    message: str
    agent_id: str
    timestamp: str
