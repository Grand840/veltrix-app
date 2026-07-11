"""
Configuration centralisée de Veltrix.
Toutes les variables d'environnement sont lues ici.
Pydantic-settings valide automatiquement les types et lève une erreur
claire si une variable obligatoire manque.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    app_name: str = "Veltrix API"
    app_version: str = "0.1.0"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api/v1"

    # Base de données PostgreSQL
    postgres_user: str = "veltrix"
    postgres_password: str = "veltrix_dev_password"
    postgres_db: str = "veltrix_db"
    postgres_host: str = "postgres"
    postgres_port: int = 5432

    # Redis
    redis_url: str = "redis://redis:6379"

    # VictoriaMetrics
    victoria_metrics_url: str = "http://victoria-metrics:8428"

    # Sécurité JWT
    secret_key: str = "dev_secret_key_change_in_production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    @property
    def database_url(self) -> str:
        """
        Construit l'URL de connexion PostgreSQL.
        Format : postgresql://user:password@host:port/dbname
        """
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def async_database_url(self) -> str:
        """
        URL pour la connexion asynchrone (asyncpg).
        SQLAlchemy async nécessite le driver asyncpg.
        """
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


    # URL de base (générée depuis le navigateur, pour les commandes d'install)
    veltrix_base_url: str = "http://localhost:8000"

    # Email Resend
    resend_api_key: str = ""
    from_email: str = "onboarding@resend.dev"
    from_name: str = "Veltrix"

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """
    Retourne l'instance Settings en cache.
    lru_cache = l'objet est créé une seule fois, puis réutilisé.
    Évite de relire le fichier .env à chaque requête.
    """
    return Settings()


# Instance globale pour import direct
settings = get_settings()