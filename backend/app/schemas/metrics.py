from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class MetricPayload(BaseModel):
    api_key: str = Field(..., min_length=1)
    hostname: str = Field(..., min_length=1)
    os_info: Optional[str] = Field(default=None, description="Systeme d exploitation de l agent")
    ip_address: Optional[str] = Field(default=None, description="Adresse IP de l agent")
    uptime_seconds: Optional[int] = Field(default=0, ge=0)
    cpu_pct: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    cpu_load_1: Optional[float] = Field(default=0.0, ge=0.0)
    cpu_load_5: Optional[float] = Field(default=0.0, ge=0.0)
    cpu_load_15: Optional[float] = Field(default=0.0, ge=0.0)
    mem_total_gb: Optional[float] = Field(default=0.0, ge=0.0)
    mem_used_gb: Optional[float] = Field(default=0.0, ge=0.0)
    mem_used_pct: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    disk_total_gb: Optional[float] = Field(default=0.0, ge=0.0)
    disk_used_gb: Optional[float] = Field(default=0.0, ge=0.0)
    disk_used_pct: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    network_bytes_sent: Optional[float] = Field(default=0.0, ge=0.0, description="Cumulative total bytes sent")
    network_bytes_recv: Optional[float] = Field(default=0.0, ge=0.0, description="Cumulative total bytes received")
    network_bytes_sent_per_sec: Optional[float] = Field(default=0.0, ge=0.0, description="Network bytes sent per second (delta)")
    network_bytes_recv_per_sec: Optional[float] = Field(default=0.0, ge=0.0, description="Network bytes received per second (delta)")

    class Config:
        from_attributes = True


class MetricsResponse(MetricPayload):
    id: int
    recorded_at: datetime

    class Config:
        from_attributes = True


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
