#!/bin/bash
# Veltrix Agent - Installation automatique
# Usage: curl -fsSL https://veltrix.ddns.net/downloads/install.sh | bash
# Ou:    curl -fsSL https://veltrix.ddns.net/downloads/install.sh | VELTRIX_KEY=vltx_xxx bash

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC}  $1"; }

BASE_URL="${VELTRIX_BASE_URL:-https://veltrix.ddns.net}"
BINARY="veltrix-agent-linux-amd64"
INSTALL_DIR="/usr/local/bin"
SERVICE_NAME="veltrix-agent"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
AGENT_PATH="$INSTALL_DIR/$SERVICE_NAME"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Veltrix Agent - Installation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Vérifier root
if [[ $EUID -ne 0 ]]; then
  err "Ce script doit etre lance en root (sudo)."
  echo "  curl -fsSL $BASE_URL/downloads/install.sh | sudo bash"
  exit 1
fi

# Détection OS/arch
ARCH=$(uname -m)
OS=$(uname -s)
if [[ "$OS" != "Linux" ]]; then
  err "OS non supporte: $OS (Linux uniquement)"
  exit 1
fi
if [[ "$ARCH" != "x86_64" ]]; then
  err "Architecture non supportee: $ARCH (x86_64 uniquement)"
  exit 1
fi

info "Systeme: $OS $ARCH"

# Vérifier VELTRIX_KEY
if [[ -z "$VELTRIX_KEY" ]]; then
  echo ""
  err "VEUTRIX_KEY manquante."
  echo ""
  echo -e "  Utilisez la commande fournie dans le dashboard :"
  echo -e "  ${GREEN}curl -fsSL $BASE_URL/downloads/install.sh | sudo VELTRIX_KEY=vltx_votre_cle bash${NC}"
  echo ""
  echo -e "  Ou modifiez le fichier systemd apres installation :"
  echo -e "  sudo nano /etc/systemd/system/veltrix-agent.service"
  echo ""
  exit 1
fi

# Télécharger le binaire
info "Telechargement de l'agent..."
wget -q --show-progress -O "/tmp/$BINARY" "$BASE_URL/downloads/$BINARY" || {
  err "Echec du telechargement depuis $BASE_URL/downloads/$BINARY"
  exit 1
}
ok "Agent telecharge"

# Installer
info "Installation dans $INSTALL_DIR..."
chmod +x "/tmp/$BINARY"
mv "/tmp/$BINARY" "$AGENT_PATH"
ok "Agent installe dans $AGENT_PATH"

# Créer le service systemd
info "Creation du service systemd..."
cat > "$SERVICE_FILE" << SYSEOF
[Unit]
Description=Veltrix Agent - Monitoring de serveur
Documentation=https://veltrix.ddns.net/docs
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
Environment=VELTRIX_KEY=$VELTRIX_KEY
Environment=VELTRIX_URL=$BASE_URL
Environment=VELTRIX_INTERVAL=30
ExecStart=$AGENT_PATH
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SYSEOF

systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"
ok "Service systemd cree et demarre"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation terminee !${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Commandes de gestion :${NC}"
echo ""
echo "  sudo systemctl status $SERVICE_NAME    # Voir le statut"
echo "  sudo systemctl start $SERVICE_NAME     # Demarrer"
echo "  sudo systemctl stop $SERVICE_NAME      # Arreter"
echo "  sudo systemctl restart $SERVICE_NAME   # Redemarrer"
echo "  sudo journalctl -u $SERVICE_NAME -f    # Voir les logs en direct"
echo ""
echo -e "${BLUE}Fichier de configuration :${NC}"
echo "  $SERVICE_FILE"
echo ""
echo -e "${BLUE}Variables d environnement (modifier $SERVICE_FILE puis restart) :${NC}"
echo "  VELTRIX_KEY       : Cle API (obligatoire)"
echo "  VELTRIX_URL       : URL du serveur Veltrix (defaut: https://veltrix.ddns.net)"
echo "  VELTRIX_INTERVAL  : Intervalle de collecte en secondes (defaut: 30, min: 10)"
echo ""

echo -e "${BLUE}Pour desinstaller :${NC}"
echo "  sudo systemctl stop $SERVICE_NAME && sudo systemctl disable $SERVICE_NAME"
echo "  sudo rm $SERVICE_FILE && sudo rm $AGENT_PATH"
echo "  sudo systemctl daemon-reload"
echo ""
echo -e "${GREEN}Votre serveur apparaitra dans le dashboard dans 30 secondes !${NC}"
echo ""
