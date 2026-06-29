"""
Modèle de base avec champs communs à toutes les tables.
Toutes les tables Veltrix héritent de BaseModel.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class BaseModel(Base):
    """
    Classe abstraite — ne crée pas de table en BDD.
    Fournit : id (UUID), created_at, updated_at.

    Pourquoi UUID et pas Integer auto-increment ?
    - Pas de collision si on fusionne des bases de données
    - Pas de séquence devinable (sécurité)
    - Compatible avec une future architecture distribuée
    """
    __abstract__ = True  # SQLAlchemy ne crée pas de table pour cette classe

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        comment="Identifiant unique universel"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        comment="Date de création (UTC)"
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,  # Mis à jour automatiquement
        nullable=False,
        comment="Date de dernière modification (UTC)"
    )

    def to_dict(self) -> dict:
        """Convertit le modèle en dictionnaire (utile pour le debug)."""
        return {
            col.name: getattr(self, col.name)
            for col in self.__table__.columns
        }
