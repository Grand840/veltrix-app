#!/bin/bash
set -e
cd ~/veltrix
echo "📥 Pull depuis GitHub..."
git pull origin main
echo "🔨 Rebuild des images modifiées..."
echo victor | sudo -S docker compose -f docker-compose.yml -f docker-compose.prod.yml build
echo "▶️  Redémarrage des services..."
echo victor | sudo -S docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
echo "🗃️  Migrations..."
echo victor | sudo -S docker compose -f docker-compose.yml -f docker-compose.prod.yml exec -T api alembic upgrade head
echo "✅ Mise à jour terminée !"
echo victor | sudo -S docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
