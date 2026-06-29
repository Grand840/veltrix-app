# Guide de Setup — Environnement de développement Veltrix

## Prérequis système

- Ubuntu 24.04+ ou 26.04
- Git 2.43+
- Docker 24+ avec Compose V2

## Outils installés

| Outil | Version | Installer via |
|-------|---------|--------------|
| Python | 3.12.7 | pyenv |
| Go | 1.22.5 | Tarball officiel |
| Node.js | 20.x LTS | nvm |
| Docker | 24+ | Déjà présent |

## Installation complète

### 1. Cloner le repo

```bash
git clone git@github.com:TON_USERNAME/veltrix.git
cd veltrix
```

### 2. Copier les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec tes valeurs si nécessaire
```

### 3. Lancer la stack

```bash
docker compose up -d --build
```

### 4. Vérifier que tout est en ligne

```bash
curl http://localhost:8000/health
# Attendu : {"status":"ok","service":"veltrix-api","version":"0.1.0"}

curl http://localhost:8428/health
# Attendu : "ok"

docker compose ps
# Tous les services doivent être "running"
```

## Commandes utiles du quotidien

```bash
# Voir les logs de l'API en temps réel
docker compose logs -f api

# Voir les logs de tous les services
docker compose logs -f

# Redémarrer un service après modification
docker compose restart api

# Arrêter toute la stack
docker compose down

# Arrêter ET supprimer les volumes (reset complet)
docker compose down -v

# Accéder au shell PostgreSQL
docker compose exec postgres psql -U veltrix -d veltrix_db

# Accéder au shell Redis
docker compose exec redis redis-cli
```

## URLs de développement

| Service | URL | Description |
|---------|-----|-------------|
| API | http://localhost:8000 | Backend FastAPI |
| Swagger UI | http://localhost:8000/docs | Documentation interactive de l'API |
| ReDoc | http://localhost:8000/redoc | Documentation alternative |
| VictoriaMetrics | http://localhost:8428 | UI métriques |
| PostgreSQL | localhost:5432 | Base de données principale |
| Redis | localhost:6379 | Cache |

