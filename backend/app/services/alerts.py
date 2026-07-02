from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.alert import Alert, AlertSeverity, AlertStatus, AlertMetric
from app.models.agent import Agent


THRESHOLDS = {
    "cpu":    {"warning": 70.0, "critical": 85.0},
    "memory": {"warning": 75.0, "critical": 90.0},
    "disk":   {"warning": 80.0, "critical": 90.0},
}


def _get_severity(value: float, metric_type: str) -> Optional[AlertSeverity]:
    t = THRESHOLDS.get(metric_type)
    if not t:
        return None
    if value >= t["critical"]:
        return AlertSeverity.CRITICAL
    elif value >= t["warning"]:
        return AlertSeverity.WARNING
    return None


def _get_or_create_alert(
    db: Session,
    agent: Agent,
    metric: AlertMetric,
    severity: AlertSeverity,
    title: str,
    message: str,
    threshold_value: float,
    current_value: float,
) -> Optional[Alert]:
    existing = db.query(Alert).filter(
        Alert.agent_id == agent.id,
        Alert.metric == metric,
        Alert.status == AlertStatus.FIRING,
    ).first()

    if existing:
        existing.current_value = current_value
        if severity == AlertSeverity.CRITICAL and existing.severity == AlertSeverity.WARNING:
            existing.severity = AlertSeverity.CRITICAL
            existing.title = title
        db.commit()
        return None

    alert = Alert(
        title=title,
        message=message,
        metric=metric,
        severity=severity,
        status=AlertStatus.FIRING,
        threshold_value=threshold_value,
        current_value=current_value,
        fired_at=datetime.utcnow(),
        agent_id=agent.id,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def check_and_create_alerts(
    agent: Agent,
    cpu: float,
    memory: float,
    disk: float,
    db: Session,
) -> list[Alert]:
    new_alerts = []
    cpu_severity = _get_severity(cpu, "cpu")
    if cpu_severity:
        threshold = THRESHOLDS["cpu"][cpu_severity.value]
        alert = _get_or_create_alert(
            db, agent, metric=AlertMetric.CPU_USAGE, severity=cpu_severity,
            title=f"CPU eleve sur {agent.name}",
            message=f"CPU a {cpu:.1f}% (seuil {cpu_severity.value} : {threshold}%)",
            threshold_value=threshold, current_value=cpu,
        )
        if alert:
            new_alerts.append(alert)
    else:
        auto_resolve_alert(agent.id, AlertMetric.CPU_USAGE, db)

    mem_severity = _get_severity(memory, "memory")
    if mem_severity:
        threshold = THRESHOLDS["memory"][mem_severity.value]
        alert = _get_or_create_alert(
            db, agent, metric=AlertMetric.MEMORY_USAGE, severity=mem_severity,
            title=f"RAM elevee sur {agent.name}",
            message=f"RAM a {memory:.1f}% (seuil {mem_severity.value} : {threshold}%)",
            threshold_value=threshold, current_value=memory,
        )
        if alert:
            new_alerts.append(alert)
    else:
        auto_resolve_alert(agent.id, AlertMetric.MEMORY_USAGE, db)

    disk_severity = _get_severity(disk, "disk")
    if disk_severity:
        threshold = THRESHOLDS["disk"][disk_severity.value]
        alert = _get_or_create_alert(
            db, agent, metric=AlertMetric.DISK_USAGE, severity=disk_severity,
            title=f"Disque sature sur {agent.name}",
            message=f"Disque a {disk:.1f}% (seuil {disk_severity.value} : {threshold}%)",
            threshold_value=threshold, current_value=disk,
        )
        if alert:
            new_alerts.append(alert)
    else:
        auto_resolve_alert(agent.id, AlertMetric.DISK_USAGE, db)

    return new_alerts


def create_agent_down_alert(agent: Agent, db: Session) -> Optional[Alert]:
    return _get_or_create_alert(
        db, agent, metric=AlertMetric.AGENT_DOWN, severity=AlertSeverity.CRITICAL,
        title=f"Agent hors ligne : {agent.name}",
        message=f"L'agent {agent.name} ({agent.hostname or 'hostname inconnu'}) ne repond plus.",
        threshold_value=None, current_value=None,
    )


def auto_resolve_alert(agent_id, metric: AlertMetric, db: Session) -> bool:
    alert = db.query(Alert).filter(
        Alert.agent_id == agent_id,
        Alert.metric == metric,
        Alert.status == AlertStatus.FIRING,
    ).first()
    if not alert:
        return False
    alert.status = AlertStatus.RESOLVED
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return True


def get_alerts(
    organization_id: str,
    db: Session,
    page: int = 1,
    per_page: int = 20,
    status_filter: Optional[str] = None,
    severity_filter: Optional[str] = None,
) -> tuple[list[dict], int, int, int]:
    query = (
        db.query(Alert, Agent)
        .join(Agent, Alert.agent_id == Agent.id)
        .filter(Agent.organization_id == organization_id)
    )

    if status_filter:
        query = query.filter(Alert.status == AlertStatus(status_filter))
    if severity_filter:
        query = query.filter(Alert.severity == AlertSeverity(severity_filter))

    total = query.count()
    total_critical = (
        db.query(func.count(Alert.id))
        .join(Agent, Alert.agent_id == Agent.id)
        .filter(
            Agent.organization_id == organization_id,
            Alert.status == AlertStatus.FIRING,
            Alert.severity == AlertSeverity.CRITICAL,
        ).scalar()
    )
    total_firing = (
        db.query(func.count(Alert.id))
        .join(Agent, Alert.agent_id == Agent.id)
        .filter(
            Agent.organization_id == organization_id,
            Alert.status == AlertStatus.FIRING,
        ).scalar()
    )

    rows = (
        query
        .order_by(Alert.fired_at.desc().nullslast())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    results = [{"alert": alert, "agent_name": agent.name} for alert, agent in rows]
    return results, total, total_critical, total_firing


def acknowledge_alert(
    alert_id: str,
    organization_id: str,
    user_id: str,
    db: Session,
    comment: Optional[str] = None,
) -> Optional[Alert]:
    alert = (
        db.query(Alert)
        .join(Agent, Alert.agent_id == Agent.id)
        .filter(
            Alert.id == alert_id,
            Agent.organization_id == organization_id,
            Alert.status == AlertStatus.FIRING,
        ).first()
    )
    if not alert:
        return None
    alert.status = AlertStatus.ACKNOWLEDGED
    alert.acknowledged_at = datetime.utcnow()
    alert.acknowledged_by = user_id
    db.commit()
    db.refresh(alert)
    return alert

