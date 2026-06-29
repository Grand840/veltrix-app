"""
User — Membre d'une Organization.
Un User appartient exactement à une Organization.
"""
from sqlalchemy import Column, String, Boolean, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.models.base import BaseModel


class UserRole(str, enum.Enum):
    """Rôles disponibles dans une organisation."""
    OWNER = "owner"   # Créateur, accès complet + billing
    ADMIN = "admin"   # Accès complet sauf billing
    MEMBER = "member" # Lecture + acquittement alertes


class User(BaseModel):
    """
    Utilisateur de la plateforme Veltrix.
    S'authentifie avec email + mot de passe.
    """
    __tablename__ = "users"

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="Email unique, utilisé pour la connexion"
    )

    hashed_password = Column(
        String(255),
        nullable=False,
        comment="Hash bcrypt du mot de passe — JAMAIS le mot de passe clair"
    )

    full_name = Column(
        String(255),
        nullable=True,
        comment="Nom complet affiché dans l'interface"
    )

    phone = Column(
        String(20),
        nullable=True,
        comment="Numéro pour alertes SMS (format international: +228...)"
    )

    role = Column(
        Enum(UserRole, values_callable=lambda x: [e.value for e in x]),
        default=UserRole.MEMBER,
        nullable=False,
        comment="Rôle dans l'organisation"
    )

    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Compte actif ou désactivé"
    )

    is_verified = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="Email vérifié via le lien de confirmation"
    )

    # Clé étrangère vers Organization
    organization_id = Column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Organisation à laquelle appartient cet utilisateur"
    )

    # Relations
    organization = relationship(
        "Organization",
        back_populates="users"
    )

    alerts = relationship(
        "Alert",
        back_populates="acknowledged_by_user",
        foreign_keys="Alert.acknowledged_by"
    )

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
