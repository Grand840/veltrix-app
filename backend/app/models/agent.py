"""
Agent — Un serveur ou machine surveillé par Veltrix.
L'agent Go est installé sur la machine et envoie des métriques ici.
"""
from sqlalchemy import Column, String, Boolean, Enum, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel


class AgentStatus(str, enum.Enum):
    """Statut de connexion de l'agent."""
    ONLINE = "online"       # A envoyé des métriques dans les 2 dernières minutes
    OFFLINE = "offline"     # Aucune métrique depuis > 2 minutes
    PENDING = "pending"     # Installé mais jamais connecté
    DISABLED = "disabled"   # Désactivé manuellement


class Agent(BaseModel):
    """
    Représente une machine surveillée.
    Chaque agent a une clé API unique utilisée pour s'authentifier
    lors de l'envoi de métriques.
    """
    __tablename__ = "agents"

    name = Column(
        String(255),
        nullable=False,
        comment="Nom lisible (ex: prod-server-01, db-master)"
    )

    hostname = Column(
        String(255),
        nullable=True,
        comment="Hostname détecté automatiquement par l'agent"
    )

    api_key = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
        comment="Clé secrète utilisée par l'agent pour s'authentifier"
    )

    status = Column(
        Enum(AgentStatus),
        default=AgentStatus.PENDING,
        nullable=False,
        index=True,
        comment="Statut de connexion actuel"
    )

    os_info = Column(
        String(255),
        nullable=True,
        comment="OS détecté (ex: Ubuntu 22.04 LTS)"
    )

    ip_address = Column(
        String(45),  # 45 chars pour supporter IPv6
        nullable=True,
        comment="Dernière adresse IP connue de l'agent"
    )

    last_seen_at = Column(
        DateTime,
        nullable=True,
        comment="Dernière fois que l'agent a envoyé des métriques"
    )

    description = Column(
        Text,
        nullable=True,
        comment="Description libre (rôle du serveur, notes)"
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Agent actif (compte dans les limites du plan)"
    )

    # Clé étrangère
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Relations
    organization = relationship(
        "Organization",
        back_populates="agents"
    )

    alerts = relationship(
        "Alert",
        back_populates="agent",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Agent {self.name} ({self.status})>"
