# Schéma de Base de Données — Veltrix

## Vue d'ensemble
Organization (1) ──── (N) User

Organization (1) ──── (N) Agent

Agent        (1) ──── (N) Alert

User         (1) ──── (N) Alert  (acknowledged_by)
## Tables

### organizations
Le compte client racine. Tout appartient à une organisation.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| name | VARCHAR(255) | Nom affiché |
| slug | VARCHAR(100) | Identifiant URL (unique) |
| plan | ENUM | free / starter / pro / enterprise |
| max_agents | INTEGER | Limite d'agents selon le plan |
| is_active | BOOLEAN | Compte actif |
| created_at | TIMESTAMP | Date de création |
| updated_at | TIMESTAMP | Dernière modification |

### users
Membres d'une organisation.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| email | VARCHAR(255) | Email unique (login) |
| hashed_password | VARCHAR(255) | Hash bcrypt |
| full_name | VARCHAR(255) | Nom complet |
| phone | VARCHAR(20) | Numéro SMS (+228...) |
| role | ENUM | owner / admin / member |
| is_active | BOOLEAN | Compte actif |
| is_verified | BOOLEAN | Email confirmé |
| organization_id | UUID | FK → organizations |

### agents
Serveurs/machines surveillés.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| name | VARCHAR(255) | Nom lisible |
| hostname | VARCHAR(255) | Hostname auto-détecté |
| api_key | VARCHAR(64) | Clé d'authentification de l'agent |
| status | ENUM | online / offline / pending / disabled |
| os_info | VARCHAR(255) | OS détecté |
| ip_address | VARCHAR(45) | Dernière IP connue |
| last_seen_at | TIMESTAMP | Dernière communication |
| organization_id | UUID | FK → organizations |

### alerts
Alertes déclenchées par dépassement de seuil.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| title | VARCHAR(255) | Titre court |
| message | TEXT | Description détaillée |
| metric | ENUM | cpu_usage / memory_usage / disk_usage / agent_down / network_latency |
| severity | ENUM | info / warning / critical |
| status | ENUM | firing / acknowledged / resolved |
| threshold_value | FLOAT | Seuil configuré (ex: 80.0) |
| current_value | FLOAT | Valeur au déclenchement |
| fired_at | TIMESTAMP | Moment du déclenchement |
| resolved_at | TIMESTAMP | Moment de résolution |
| sms_sent | BOOLEAN | SMS envoyé ? |
| email_sent | BOOLEAN | Email envoyé ? |
| agent_id | UUID | FK → agents |
| acknowledged_by | UUID | FK → users |

## Migrations

Utiliser Alembic pour toute modification de schéma :

```bash
# Créer une nouvelle migration
alembic revision --autogenerate -m "description_du_changement"

# Appliquer toutes les migrations
alembic upgrade head

# Voir l'historique des migrations
alembic history

# Annuler la dernière migration
alembic downgrade -1
```

## Décisions d'architecture

**Pourquoi UUID et pas INTEGER auto-increment ?**
Les UUIDs évitent les collisions lors de fusions de bases, ne sont pas
devinables (sécurité), et préparent à une future architecture distribuée.

**Pourquoi les métriques ne sont pas dans PostgreSQL ?**
Les métriques (CPU, RAM, Disk toutes les 30s) génèrent des millions de
lignes rapidement. VictoriaMetrics est une base de données de séries
temporelles optimisée pour ce cas d'usage (compression 10x, requêtes
5x plus rapides que PostgreSQL pour ce type de données).
