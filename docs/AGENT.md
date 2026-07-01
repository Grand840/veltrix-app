# Guide de l'Agent Veltrix

## Vue d'ensemble

L'agent Veltrix est un binaire Go léger (~10MB) qui collecte les metriques
de la machine hote et les envoie a l'API Veltrix toutes les 30 secondes.

## Installation

### Pre-requis
- Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- Aucun dependance externe — binaire statique autonome

### Methode 1 : Variable d'environnement (developpement)

```bash
export VELTRIX_KEY=vltx_votre_cle_ici
export VELTRIX_URL=http://localhost:8000  # ou https://api.veltrix.io
./veltrix-agent
```

### Methode 2 : Service systemd (production — Semaine 6)

```ini
[Unit]
Description=Veltrix Monitoring Agent
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/veltrix-agent
Environment=VELTRIX_KEY=vltx_votre_cle_ici
Environment=VELTRIX_URL=https://api.veltrix.io
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Variables d'environnement

| Variable | Obligatoire | Defaut | Description |
|----------|-------------|--------|-------------|
| `VELTRIX_KEY` | Oui | — | Cle API de l'agent (format `vltx_...`) |
| `VELTRIX_URL` | Non | `https://api.veltrix.io` | URL de l'API |
| `VELTRIX_INTERVAL` | Non | `30` | Intervalle d'envoi en secondes (min: 10) |
| `VELTRIX_BUFFER_DIR` | Non | `/tmp/veltrix-buffer` | Dossier buffer hors-ligne |

## Metriques collectees

| Metrique | Description | Unite |
|----------|-------------|-------|
| `cpu_usage_percent` | Utilisation CPU globale | % (0-100) |
| `memory_usage_percent` | Utilisation RAM | % (0-100) |
| `memory_used_mb` | RAM utilisee | MB |
| `memory_total_mb` | RAM totale | MB |
| `disk_usage_percent` | Utilisation disque (/) | % (0-100) |
| `disk_used_gb` | Espace disque utilise | GB |
| `disk_total_gb` | Espace disque total | GB |
| `network_bytes_sent` | Bytes envoyes depuis demarrage | Bytes |
| `network_bytes_recv` | Bytes recus depuis demarrage | Bytes |

## Fonctionnement hors-ligne (store-and-forward)

Si l'API est inaccessible :
1. Les metriques sont serialisees en JSON et sauvegardees dans `VELTRIX_BUFFER_DIR`
2. Chaque fichier = un cycle de collecte (format : `{timestamp_ns}.json`)
3. Au retour de la connexion, le buffer est vide dans l'ordre chronologique
4. Limite : `MaxBufferSize=2000` fichiers (~16h a 30s d'intervalle)

## Compilation depuis les sources

```bash
cd agent/
go mod tidy
go build -o veltrix-agent .
```

Pour un binaire statique (sans dependance glibc) :
```bash
CGO_ENABLED=0 GOOS=linux go build -o veltrix-agent .
```
