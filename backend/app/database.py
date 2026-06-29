"""
Configuration SQLAlchemy et gestion des sessions de base de données.

On utilise le mode synchrone pour simplifier le code du MVP.
Le mode async (asyncpg) sera activé en Phase 2 si les performances
le nécessitent.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Création du moteur SQLAlchemy
# pool_pre_ping=True : vérifie la connexion avant chaque utilisation
# (évite les erreurs "connection lost" après inactivité)
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,          # Nombre de connexions dans le pool
    max_overflow=20,       # Connexions supplémentaires si pool plein
    echo=settings.debug,   # Log SQL en développement, silence en prod
)

# Factory de sessions
SessionLocal = sessionmaker(
    autocommit=False,  # On gère les transactions manuellement
    autoflush=False,
    bind=engine
)

# Classe de base pour tous les modèles SQLAlchemy
Base = declarative_base()


def get_db():
    """
    Générateur de session de base de données.
    Utilisé comme dépendance FastAPI avec Depends(get_db).

    Le pattern try/finally garantit que la session est
    toujours fermée, même si une erreur survient.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
