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
