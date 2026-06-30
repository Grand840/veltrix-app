# API Reference - Veltrix

## Endpoints

### System

| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | /health | Non | Statut API + BDD |
| GET | / | Non | Info API |

### Authentication - /api/v1/auth

| Methode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | /auth/register | Non | Creer un compte |
| POST | /auth/login | Non | Se connecter |
| GET | /auth/me | Oui | Mon profil |
| POST | /auth/logout | Oui | Se deconnecter |

### Agents - /api/v1/agents

Tous les endpoints necessitent Authorization: Bearer <token>

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | /agents | Creer un agent |
| GET | /agents | Lister les agents |
| GET | /agents/{id} | Detail d un agent |
| PATCH | /agents/{id} | Modifier un agent |
| DELETE | /agents/{id} | Supprimer un agent (soft delete) |
