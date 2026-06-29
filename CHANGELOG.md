# Changelog Veltrix

## [Unreleased]

## [0.0.1] - Jour 01 - Setup & Foundation

### Ajouté
- Structure complète du projet (backend, agent, frontend, docs, infra)
- Stack Docker Compose : PostgreSQL 16, Redis 7, VictoriaMetrics, FastAPI
- Endpoint /health sur l'API FastAPI
- Documentation initiale : README.md, docs/SETUP.md
- Configuration Git avec .gitignore propre

### Environnement
- Python 3.12.7 via pyenv
- Go 1.22.5
- Node.js 20 LTS via nvm
- Ubuntu 26.04

### Tests
- ✅ 10/10 tests Jour 01 passés

## [0.0.2] - Jour 02 - Database Models & Migrations

### Ajouté
- Modèles SQLAlchemy : Organization, User, Agent, Alert
- BaseModel abstrait avec UUID, created_at, updated_at
- Configuration Alembic + migration initiale appliquée
- Endpoint /health vérifie PostgreSQL en temps réel
- docs/DATABASE.md : schéma complet documenté

### Décisions techniques
- UUID comme clé primaire (pas d'auto-increment)
- Séparation PostgreSQL (données) / VictoriaMetrics (métriques)
- Alembic pour versionner les changements de schéma

### Tests
- ✅ 11/11 tests Jour 02 passés
