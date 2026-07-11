# Guide Onboarding Beta — Veltrix

Bienvenue dans le programme beta de Veltrix !

## 1. Créez votre compte

Rendez-vous sur https://veltrix.ddns.net/register

## 2. Obtenez votre clé API

Dashboard > Agents > Ajouter un agent > copiez la clé (elle ne s'affichera qu'une fois).

## 3. Installez l'agent en une commande

```bash
curl -fsSL https://veltrix.ddns.net/downloads/install.sh | sudo VELTRIX_KEY=vltx_votre_cle bash
```

Le script :
- Télécharge l'agent
- Crée le service systemd
- Démarre automatiquement la surveillance

## 4. Vérifiez

Dans 30 secondes, votre serveur apparait "En ligne" dans le dashboard.

## Commandes de gestion

```bash
sudo systemctl status veltrix-agent     # Statut
sudo systemctl start veltrix-agent      # Démarrer
sudo systemctl stop veltrix-agent       # Arrêter
sudo systemctl restart veltrix-agent    # Redémarrer
sudo journalctl -u veltrix-agent -f     # Logs en direct
```

## Modifier la configuration

```bash
sudo nano /etc/systemd/system/veltrix-agent.service
# Modifier VELTRIX_KEY, VELTRIX_URL ou VELTRIX_INTERVAL
sudo systemctl daemon-reload && sudo systemctl restart veltrix-agent
```

## Désinstaller

```bash
sudo systemctl stop veltrix-agent && sudo systemctl disable veltrix-agent
sudo rm /etc/systemd/system/veltrix-agent.service /usr/local/bin/veltrix-agent
sudo systemctl daemon-reload
```

## Ce qu'on attend de vous

- Utilisez Veltrix pendant 2 semaines minimum
- Signalez tout bug ou point bloquant
- Donnez votre avis pour améliorer le produit

## Contact

**Email** : contact@veltrix.io ou younoustchao@gmail.com
**Réponse** : garantie sous 24h

---

Merci de nous aider à construire le meilleur outil de monitoring pour l'Afrique !
