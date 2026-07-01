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

## [0.0.3] - Jour 03 - Authentication System

### Ajoute
- Schemas Pydantic : RegisterRequest, LoginRequest, TokenResponse, UserResponse
- Service auth : hash_password (bcrypt), verify_password, create/decode JWT
- register_user : cree Organization + User (OWNER) en transaction atomique
- login_user : verification securisee avec message d erreur generique
- Dependance get_current_user : protege les endpoints avec Depends()
- Endpoints : POST /auth/register, POST /auth/login, GET /auth/me, POST /auth/logout
- Fichier de tests REST Client : tests/http/auth.http

### Securite
- Bcrypt pour le hachage (irreversible)
- JWT HS256 signe avec SECRET_KEY
- Erreur generique login (anti-enumeration des comptes)
- hashed_password jamais expose dans les reponses API

### Correctifs
- bcrypt==4.0.1 ajoute aux requirements (compatibilite passlib)

### Tests
- 12/12 tests Jour 03 passes

## [0.0.4] - Jour 04 - Agents CRUD

### Ajoute
- Schemas Pydantic : AgentCreateRequest, AgentUpdateRequest, AgentResponse, AgentListResponse, AgentInstallCommand
- Service agents : create_agent (avec verif limite plan), get_agents, get_agent_by_id, update_agent, delete_agent (soft), update_agent_heartbeat, generate_api_key
- Dependance get_current_agent : auth par cle API (header X-Agent-Key) pour l agent Go
- Router /api/v1/agents : POST, GET, GET/{id}, PATCH/{id}, DELETE/{id}
- Fichier tests/http/agents.http : 11 cas de test

### Securite
- Multi-tenancy : chaque org ne voit que ses propres agents
- api_key retournee UNE SEULE FOIS (a la creation) - null ensuite
- Soft delete : is_active=False, donnees historiques preservees
- Limite d agents verifiee selon le plan (free=3)

### Tests
- 13/13 tests Jour 04 passes
## [0.0.5] - Jour 05 - Metrics Pipeline

### Ajoute
- Schemas Pydantic : MetricPayload, MetricPoint, MetricSeries, AgentMetricsSummary, MetricsReceiveResponse
- formats/schemas/metrics.py : validation des payloads agents, query responses
- services/metrics.py : ecriture en format Prometheus vers VictoriaMetrics, queries instant/range, calcul de sante
- routers/metrics.py : POST /metrics/ingest, GET /agents/{id}/summary, GET /agents/{id}/history/{metric}, GET /metrics/overview
- Fichier de tests REST Client : tests/http/metrics.http

### Decisions techniques
- Format Prometheus exposition pour VictoriaMetrics : compatible Grafana futur
- Labels appliquees a chaque metrique : agent_id, org_id, hostname
- Indisponibilite VictoriaMetrics ne plante pas l'API (retour success=false)
- 9 metriques standard : cpu, memory (usage/used/total), disk (usage/used/total), network (sent/recv)

### Tests
- Ingest via X-Agent-Key : OK
- Summary via JWT : OK (donnees live depuis VM)
- History via JWT : OK (points temporels avec timestamps)
- Overview via JWT : OK (tous les agents de l'org)

