#!/bin/bash
set -e
echo "🚀 Déploiement Veltrix..."
PULL=false
MIGRATE=false
for arg in "$@"; do
  case $arg in --pull) PULL=true ;; --migrate) MIGRATE=true ;; esac
done
[ -f ".env.production" ] || { echo "❌ .env.production manquant"; exit 1; }
if $PULL; then
  echo "📥 Pull des images Docker..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
fi
echo "🔨 Build des images..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
echo "▶️  Lancement des services..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
if $MIGRATE; then
  echo "🗃️  Application des migrations..."
  docker compose -f docker-compose.yml -f docker-compose.prod.yml exec api alembic upgrade head
fi
echo "🏥 Vérification de la santé des services..."
sleep 5
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
if curl -sf http://localhost:8000/health > /dev/null; then echo "✅ API en ligne"; else echo "❌ API non accessible"; fi
if curl -sf http://localhost:3000/api/health > /dev/null; then echo "✅ Frontend en ligne"; else echo "⚠️  Frontend pas encore prêt"; fi
echo ""
echo "✅ Déploiement terminé !"
echo "   API     : http://localhost:8000/docs"
echo "   Frontend : http://localhost:3000"
