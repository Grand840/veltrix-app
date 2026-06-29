# Veltrix — Infrastructure Monitoring SaaS

> Your infrastructure, under control.

Veltrix est une plateforme SaaS de monitoring d'infrastructure IT,
conçue pour fonctionner sur des réseaux instables, avec une interface
zéro-expertise et des alertes SMS/WhatsApp.

## Architecture rapide
Agent Go (léger) → API FastAPI → VictoriaMetrics + PostgreSQL → Dashboard Next.js
## Stack technique

- **Backend** : Python 3.12 + FastAPI
- **Agent** : Go 1.22
- **Base de données** : PostgreSQL 16 + VictoriaMetrics
- **Frontend** : Next.js 14 + Tailwind CSS
- **Cache** : Redis 7

## Démarrage rapide

```bash
# Cloner et démarrer
git clone git@github.com:TON_USERNAME/veltrix.git
cd veltrix
cp .env.example .env
docker compose up -d
```

## Documentation

- [Setup environnement](docs/SETUP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Base de données](docs/DATABASE.md)
- [API Reference](docs/API.md)
- [Agent](docs/AGENT.md)

## Statut du projet

🟡 Phase 0 — Fondations (Semaine 0)

