"""
Organization — Le compte client racine.
Tout dans Veltrix appartient à une Organization.
"""
from sqlalchemy import Column, String, Boolean, Integer, Enum, DateTime
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel


class PlanType(str, enum.Enum):
    """Plans disponibles dans Veltrix."""
    FREE = "free"           # Trial 30j puis limité
    STARTER = "starter"     # Jusqu'à 10 agents
    PRO = "pro"             # Jusqu'à 50 agents
    ENTERPRISE = "enterprise"  # Illimité


class Organization(BaseModel):
    """
    Représente une entreprise ou équipe cliente.
    Multi-tenancy : chaque org ne voit que ses propres données.
    """
    __tablename__ = "organizations"

    name = Column(
        String(255),
        nullable=False,
        comment="Nom de l'organisation"
    )

    slug = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True,  # Index pour recherche rapide par slug
        comment="Identifiant URL-friendly (ex: acme-corp)"
    )

    plan = Column(
        Enum(PlanType, values_callable=lambda x: [e.value for e in x]),
        default=PlanType.FREE,
        nullable=False,
        comment="Plan d'abonnement actuel"
    )

    max_agents = Column(
        Integer,
        default=3,  # Free tier : 3 agents max
        nullable=False,
        comment="Nombre maximum d'agents autorisés"
    )

    trial_ends_at = Column(
        DateTime,
        nullable=True,
        comment="Date de fin de la periode d essai gratuit (null = pas de trial)"
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Organisation active ou suspendue"
    )

    # Relations SQLAlchemy
    users = relationship(
        "User",
        back_populates="organization",
        cascade="all, delete-orphan"
        # Si on supprime une org, ses users sont supprimés
    )

    agents = relationship(
        "Agent",
        back_populates="organization",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Organization {self.name} ({self.plan})>"
