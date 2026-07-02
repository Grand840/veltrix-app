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


## [0.0.6] - Jour 06 - Agent Go v0.1

### Ajoute
- `agent/config.go` : config depuis variables d'environnement (VELTRIX_KEY, VELTRIX_URL, VELTRIX_INTERVAL)
- `agent/collector/cpu.go` : collecte CPU via gopsutil (cpu.Percent)
- `agent/collector/memory.go` : collecte RAM via gopsutil (mem.VirtualMemory)
- `agent/collector/disk.go` : collecte disque "/" via gopsutil (disk.Usage)
- `agent/collector/network.go` : stats reseau agregees via gopsutil (net.IOCounters)
- `agent/collector/collector.go` : agregateur central, degradation gracieuse par metrique
- `agent/sender/buffer.go` : store-and-forward sur disque (fichiers JSON horodates, FIFO, limite 2000)
- `agent/sender/http.go` : envoi HTTP avec flush buffer automatique avant chaque cycle
- `agent/main.go` : boucle principale, ticker configurable, arret propre SIGTERM/SIGINT
- `docs/AGENT.md` : guide complet d'installation et de configuration

### Technique
- Binaire statique Go (~7.4MB), zero dependance externe a l'execution
- gopsutil v3.24.5 pour la collecte cross-platform
- Store-and-forward : ~16h de buffer a 30s d'intervalle
- Arret propre sur SIGTERM (compatible systemd et Docker)

### Tests
- 10/10 tests Jour 06 passes

## [0.0.7] - Jour 07 - Review & Consolidation Semaine 0

### Tests automatises ajoutes
- `tests/conftest.py` : fixtures partagees (client SQLite, registered_user, auth_headers, created_agent)
- `tests/test_system.py` : health check, OpenAPI schema, securite globale (8 tests)
- `tests/test_auth.py` : register (7), login (4), /me (4) = 15 tests auth
- `tests/test_agents.py` : create (5), list (3), get (3), update (2), delete (1) = 14 tests agents
- `pytest.ini` : configuration asyncio + chemins de test

### Documentation complete
- `docs/ARCHITECTURE.md` : schema ASCII complet, flux de donnees, ADR 001-005
- `docs/AGENT.md` : guide dinstallation complet (mis a jour)

### Validation
- Test bout-en-bout pipeline complet : agent -> API -> VictoriaMetrics -> query
- 37/37 tests pytest verts (SQLite, isolation totale)
- Agent Go confirme : envoi CPU/RAM/Disk fonctionnel

### Bilan Semaine 0 - Fondations completes
- Jour 01 : Setup environnement (Python 3.12, Go 1.22, Docker, Node 20)
- Jour 02 : Modeles BDD (Organization, User, Agent, Alert) + migrations Alembic
- Jour 03 : Auth JWT + bcrypt (register, login, /me, get_current_user)
- Jour 04 : Agents CRUD + cle API vltx_ + multi-tenancy
- Jour 05 : Metriques -> VictoriaMetrics (ingest, summary, history, overview)
- Jour 06 : Agent Go v0.1 (collecte CPU/RAM/Disk/Network + store-and-forward)
- Jour 07 : Tests pytest automatises + documentation + pipeline bout-en-bout


## [0.0.8] - Jour 08 - Agent v0.2

### Ajoute
- agent/logger/logger.go: logger structure JSON
- agent/collector/network.go: calcul delta bytes/sec
- agent/sender/http.go: retry exponentiel 1s/2s/4s avant buffer
- backend/app/schemas/metrics.py: nouveaux champs reseau delta

### Modifie
- agent/collector/collector.go: Metrics enrichie nouveaux champs reseau
- agent/main.go: utilise logger structure
- agent/sender/http.go: header X-Agent-Key pour auth API
- backend/app/services/metrics.py: 15 metriques Prometheus

### Technique
- Binaire statique Go ~5.3MB
- Logs JSON parsables par jq
- Retry exponentiel 3 tentatives puis buffer memoire max 100
- Toutes metriques dans VictoriaMetrics

### Tests
- 37/37 tests pytest verts
- go vet ./... OK
- go test ./... OK
- Pipeline E2E valide


## [0.0.9] - Jour 09 - API complete et erreurs standardisees

### Ajoute
- schemas/errors.py : format ErrorResponse standardise + classes VeltrixError, NotFoundError, BadRequestError
- schemas/organization.py : OrganizationStats, OrganizationResponse
- services/organization.py : get_organization_stats (agents par statut en 1 requete GROUP BY)
- routers/organization.py : GET /organizations/me, GET /organizations/me/stats
- Filtre ?status=online/offline/pending/disabled sur GET /agents
- Handler global VeltrixError dans main.py
- tests/test_organization.py : 11 nouveaux tests

### Modifie
- routers/agents.py : erreurs standardisees (NotFoundError, BadRequestError), filtre status
- services/agents.py : get_agents accepte status_filter optionnel
- main.py : exception_handler VeltrixError, router organisation ajoute

### Technique
- Toutes les erreurs 400/404 retournent {error, message, detail, status_code}
- GET /organizations/me/stats : dashboard en 1 requete
- GET /agents?status=online/offline/pending/disabled

### Tests
- 48/48 tests pytest passes
- 10 tests manuels OK (routes, filtres, format erreur, OpenAPI)