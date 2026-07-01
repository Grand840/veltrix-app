# Architecture Veltrix — Semaine 0

## Vue d'ensemble

```
+-------------------------------------------------------------+
|                        CLIENT                               |
|  Dashboard Next.js (Semaine 2)  |  Agent Go (Jour 6)        |
|  JWT dans Authorization header  |  API Key dans X-Agent-Key |
+-------------+-------------------+----------+----------------+
              | HTTPS                         | HTTPS
              v                               v
+-------------------------------------------------------------+
|                    API FastAPI (Port 8000)                   |
|                                                             |
|  /api/v1/auth/*      -> auth_router (JWT)                   |
|  /api/v1/agents/*    -> agents_router (JWT)                 |
|  /api/v1/metrics/ingest -> metrics_router (API Key)         |
|  /api/v1/metrics/*   -> metrics_router (JWT)                |
|                                                             |
|  Injectees :                                                |
|  - get_current_user(JWT) -> User SQLAlchemy                 |
|  - get_current_agent(X-Agent-Key) -> Agent SQLAlchemy       |
|  - get_db() -> Session PostgreSQL                           |
+----------+-----------------------------+--------------------+
           | SQLAlchemy ORM              | httpx async
           v                             v
+---------------------+       +----------------------------+
|   PostgreSQL 16     |       |   VictoriaMetrics :8428    |
|   Port 5432         |       |                            |
|                     |       |  Ecriture :                |
|  organizations      |       |  POST /api/v1/import/      |
|  users              |       |  prometheus                |
|  agents             |       |                            |
|  alerts             |       |  Lecture :                 |
|                     |       |  GET /api/v1/query         |
|  + alembic_ver.     |       |  GET /api/v1/query_range   |
+---------------------+       +----------------------------+
           |
           v
+---------------------+
|    Redis :6379      |
|  (Semaine 4 :       |
|  sessions, rate     |
|  limiting,          |
|  job queue)         |
+---------------------+
```

## Flux de donnees principaux

### 1. Inscription utilisateur
```
POST /auth/register
  -> Valider RegisterRequest (Pydantic)
  -> Verifier unicite email (PostgreSQL)
  -> Creer Organization (plan=free, max_agents=3)
  -> Creer User (role=owner, password=bcrypt)
  -> Generer JWT (sub=user_id, org=org_id, exp=30min)
  -> Retourner TokenResponse
```

### 2. Cycle de monitoring (toutes les 30s)
```
Agent Go
  -> Collecter CPU/RAM/Disk/Network (gopsutil)
  -> POST /api/v1/metrics/ingest (X-Agent-Key: vltx_...)
  -> API valide la cle (agents.api_key en BDD)
  -> Mettre a jour agent.last_seen_at + status=online
  -> Ecrire metriques en format Prometheus dans VictoriaMetrics
  -> Retourner MetricsReceiveResponse
```

### 3. Lecture dashboard (Semaine 2)
```
Dashboard Next.js
  -> GET /api/v1/metrics/agents/{id}/summary (Bearer JWT)
  -> API valide JWT -> recupere user + org
  -> Verifie ownership de l'agent (multi-tenancy)
  -> Query VictoriaMetrics (derniere valeur CPU/RAM/Disk)
  -> Calcule health (ok/warning/critical)
  -> Retourner AgentMetricsSummary
```

## Securite

### Authentification a deux niveaux
| Acteur | Mecanisme | Header |
|--------|-----------|--------|
| Utilisateur dashboard | JWT HS256 (30min) | `Authorization: Bearer <token>` |
| Agent Go | Cle API statique | `X-Agent-Key: vltx_<40chars>` |

### Multi-tenancy
Chaque requete verifie `organization_id`. Un utilisateur ne peut
jamais acceder aux donnees d'une autre organisation, meme s'il
connait les UUIDs. Les requetes SQL filtrent systematiquement
par `organization_id`.

### Passwords
bcrypt avec cost factor 12. Irreversible. Jamais retourne dans les reponses API.

## Stack technique

| Composant | Technologie | Version | Raison |
|-----------|-------------|---------|--------|
| API Backend | FastAPI + Python | 3.12 / 0.111 | Rapid dev, Pydantic V2, async natif |
| ORM | SQLAlchemy | 2.0.31 | API moderne, migrations Alembic |
| Migrations | Alembic | 1.13.2 | Versionnage du schema |
| BDD principale | PostgreSQL | 16 | ACID, UUID natif, JSON support |
| BDD metriques | VictoriaMetrics | latest | Time-series, 5x moins RAM que Prometheus |
| Cache | Redis | 7 | Sessions, rate limiting (Semaine 4) |
| Agent | Go | 1.22.5 | Binaire statique, gopsutil, store-and-forward |
| Collecte metriques | gopsutil | v3.24.5 | Cross-platform, CPU/RAM/Disk/Network |
| Containerisation | Docker + Compose V2 | 24+ | Dev et prod identiques |

## Decisions d'architecture (ADR)

### ADR-001 : UUID comme cle primaire
**Contexte :** Choix entre INTEGER auto-increment et UUID.
**Decision :** UUID v4 genere par Python (uuid.uuid4).
**Raisons :** Pas de sequence devinable, compatible architecture distribuee future, pas de collision lors de fusions de bases.

### ADR-002 : VictoriaMetrics pour les metriques
**Contexte :** Stocker ~1M de points de metriques/agent/mois.
**Decision :** VictoriaMetrics en container Docker separe.
**Raisons :** 5x moins de RAM que Prometheus, compatible PromQL, compression 10x, Docker image officielle legere.

### ADR-003 : Soft delete pour les agents
**Contexte :** Que faire quand un agent est "supprime" ?
**Decision :** is_active=False, jamais DELETE en BDD.
**Raisons :** Preserve l'historique des metriques, audit trail, possibilite de restauration.

### ADR-004 : Store-and-forward dans l'agent Go
**Contexte :** Reseaux instables en Afrique de l'Ouest.
**Decision :** Buffer de fichiers JSON sur disque, FIFO, 2000 max.
**Raisons :** Pas de perte de metriques lors de coupures reseau, simple a implementer, pas de dependance externe.

### ADR-005 : Cle API en clair en BDD (agents)
**Contexte :** Faut-il hasher la cle API comme les passwords ?
**Decision :** Stocker en clair.
**Raisons :** L'agent doit etre verifie a chaque requete (toutes les 30s) — le lookup doit etre rapide. Un hash bcrypt a chaque requete = trop lent. La cle est un secret cote agent, pas cote user.
