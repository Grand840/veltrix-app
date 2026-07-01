import httpx
import time
from datetime import datetime, timezone
from typing import Optional

from app.config import settings
from app.schemas.metrics import (
    MetricPayload,
    MetricPoint,
    MetricSeries,
    AgentMetricsSummary,
)


METRIC_NAMES = [
    "veltrix_cpu_usage_percent",
    "veltrix_memory_usage_percent",
    "veltrix_memory_used_mb",
    "veltrix_memory_total_mb",
    "veltrix_disk_usage_percent",
    "veltrix_disk_used_gb",
    "veltrix_disk_total_gb",
    "veltrix_network_bytes_sent",
    "veltrix_network_bytes_recv",
]


def _build_prometheus_line(
    metric_name: str,
    value: float,
    labels: dict,
    timestamp_ms: int,
) -> str:
    labels_str = ",".join(f'{k}="{v}"' for k, v in labels.items())
    return f'{metric_name}{{{labels_str}}} {value} {timestamp_ms}'


async def write_metrics(
    agent_id: str,
    org_id: str,
    payload: MetricPayload,
) -> bool:
    if payload.timestamp:
        ts_ms = int(payload.timestamp.timestamp() * 1000)
    else:
        ts_ms = int(time.time() * 1000)

    labels = {
        "agent_id": agent_id,
        "org_id": org_id,
        "hostname": payload.hostname,
    }

    metric_map = {
        "veltrix_cpu_usage_percent":    payload.cpu_usage_percent,
        "veltrix_memory_usage_percent": payload.memory_usage_percent,
        "veltrix_memory_used_mb":       payload.memory_used_mb,
        "veltrix_memory_total_mb":      payload.memory_total_mb,
        "veltrix_disk_usage_percent":   payload.disk_usage_percent,
        "veltrix_disk_used_gb":         payload.disk_used_gb,
        "veltrix_disk_total_gb":        payload.disk_total_gb,
        "veltrix_network_bytes_sent":   payload.network_bytes_sent or 0.0,
        "veltrix_network_bytes_recv":   payload.network_bytes_recv or 0.0,
    }

    lines = [
        _build_prometheus_line(name, value, labels, ts_ms)
        for name, value in metric_map.items()
    ]

    prometheus_body = "\n".join(lines)

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{settings.victoria_metrics_url}/api/v1/import/prometheus",
                content=prometheus_body,
                headers={"Content-Type": "text/plain"},
            )
            return response.status_code == 204
    except httpx.RequestError as e:
        print(f"[WARN] VictoriaMetrics write error: {e}")
        return False


async def query_instant(
    metric_name: str,
    agent_id: str,
) -> Optional[float]:
    promql = f'{metric_name}{{agent_id="{agent_id}"}}'

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{settings.victoria_metrics_url}/api/v1/query",
                params={"query": promql},
            )

        if response.status_code != 200:
            return None

        data = response.json()
        results = data.get("data", {}).get("result", [])

        if not results:
            return None

        value_str = results[0].get("value", [None, None])[1]
        return float(value_str) if value_str is not None else None

    except (httpx.RequestError, ValueError, KeyError):
        return None


async def query_range(
    metric_name: str,
    agent_id: str,
    start: str = "1h",
    end: str = "now",
    step: str = "30s",
) -> list[MetricPoint]:
    now_ts = int(time.time())
    duration_map = {"m": 60, "h": 3600, "d": 86400}

    def parse_time(t: str) -> int:
        if t == "now":
            return now_ts
        if t[-1] in duration_map:
            return now_ts - int(t[:-1]) * duration_map[t[-1]]
        return now_ts - 3600

    start_ts = parse_time(start)
    end_ts = parse_time(end)

    promql = f'{metric_name}{{agent_id="{agent_id}"}}'

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{settings.victoria_metrics_url}/api/v1/query_range",
                params={
                    "query": promql,
                    "start": start_ts,
                    "end": end_ts,
                    "step": step,
                },
            )

        if response.status_code != 200:
            return []

        data = response.json()
        results = data.get("data", {}).get("result", [])

        if not results:
            return []

        points = []
        for ts, val in results[0].get("values", []):
            points.append(MetricPoint(
                timestamp=datetime.fromtimestamp(ts, tz=timezone.utc),
                value=float(val),
            ))
        return points

    except (httpx.RequestError, ValueError, KeyError):
        return []


def compute_health(value: Optional[float], metric: str) -> str:
    if value is None:
        return "unknown"

    thresholds = {
        "cpu":    {"warning": 70.0, "critical": 85.0},
        "memory": {"warning": 70.0, "critical": 85.0},
        "disk":   {"warning": 70.0, "critical": 85.0},
    }

    t = thresholds.get(metric, {"warning": 70.0, "critical": 85.0})

    if value >= t["critical"]:
        return "critical"
    elif value >= t["warning"]:
        return "warning"
    else:
        return "ok"


async def get_agent_summary(
    agent_id: str,
    hostname: str,
    status: str,
    last_seen_at: Optional[datetime],
) -> AgentMetricsSummary:
    cpu = await query_instant("veltrix_cpu_usage_percent", agent_id)
    memory = await query_instant("veltrix_memory_usage_percent", agent_id)
    disk = await query_instant("veltrix_disk_usage_percent", agent_id)

    return AgentMetricsSummary(
        agent_id=agent_id,
        hostname=hostname,
        status=status,
        last_seen_at=last_seen_at,
        cpu_usage_percent=cpu,
        memory_usage_percent=memory,
        disk_usage_percent=disk,
        cpu_health=compute_health(cpu, "cpu"),
        memory_health=compute_health(memory, "memory"),
        disk_health=compute_health(disk, "disk"),
    )
