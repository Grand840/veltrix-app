"""
Alert — Une alerte déclenchée quand un seuil est dépassé.
Ex: CPU > 80% pendant 5 minutes → alerte créée.
"""
from sqlalchemy import Column, String, Boolean, Enum, ForeignKey, DateTime, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel


class AlertSeverity(str, enum.Enum):
    """Niveau de gravité d'une alerte."""
    INFO = "info"         # Informatif, pas urgent
    WARNING = "warning"   # À surveiller
    CRITICAL = "critical" # Action immédiate requise


class AlertStatus(str, enum.Enum):
    """Cycle de vie d'une alerte."""
    FIRING = "firing"           # Active en ce moment
    ACKNOWLEDGED = "acknowledged"  # Vue et prise en charge
    RESOLVED = "resolved"       # Problème résolu


class AlertMetric(str, enum.Enum):
    """Métriques sur lesquelles on peut créer des alertes."""
    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    DISK_USAGE = "disk_usage"
    AGENT_DOWN = "agent_down"
    NETWORK_LATENCY = "network_latency"


class Alert(BaseModel):
    """
    Alerte déclenchée par un dépassement de seuil.
    Une alerte est liée à un agent et éventuellement acquittée par un user.
    """
    __tablename__ = "alerts"

    title = Column(
        String(255),
        nullable=False,
        comment="Titre court (ex: CPU critique sur prod-server-01)"
    )

    message = Column(
        Text,
        nullable=True,
        comment="Description détaillée de l'alerte"
    )

    metric = Column(
        Enum(AlertMetric, values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        comment="Quelle métrique a déclenché l'alerte"
    )

    severity = Column(
        Enum(AlertSeverity, values_callable=lambda x: [e.value for e in x]),
        default=AlertSeverity.WARNING,
        nullable=False,
        index=True,
        comment="Niveau de gravité"
    )

    status = Column(
        Enum(AlertStatus, values_callable=lambda x: [e.value for e in x]),
        default=AlertStatus.FIRING,
        nullable=False,
        index=True,
        comment="Statut actuel de l'alerte"
    )

    threshold_value = Column(
        Float,
        nullable=True,
        comment="Seuil configuré qui a déclenché l'alerte (ex: 80.0 pour 80%)"
    )

    current_value = Column(
        Float,
        nullable=True,
        comment="Valeur mesurée au moment du déclenchement (ex: 94.5)"
    )

    fired_at = Column(
        DateTime,
        nullable=True,
        comment="Moment exact du déclenchement"
    )

    resolved_at = Column(
        DateTime,
        nullable=True,
        comment="Moment de la résolution (null si encore active)"
    )

    acknowledged_at = Column(
        DateTime,
        nullable=True,
        comment="Moment de l'acquittement"
    )

    # Notifications envoyées
    sms_sent = Column(Boolean, default=False, comment="SMS envoyé ?")
    email_sent = Column(Boolean, default=False, comment="Email envoyé ?")
    whatsapp_sent = Column(Boolean, default=False, comment="WhatsApp envoyé ?")

    # Clés étrangères
    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agents.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    acknowledged_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="User qui a acquitté l'alerte"
    )

    # Relations
    agent = relationship("Agent", back_populates="alerts")
    acknowledged_by_user = relationship(
        "User",
        back_populates="alerts",
        foreign_keys=[acknowledged_by]
    )

    def __repr__(self) -> str:
        return f"<Alert {self.title} ({self.severity}/{self.status})>"
