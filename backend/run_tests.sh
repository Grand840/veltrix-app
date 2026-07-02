#!/bin/bash
set -e
MODE=${1:-unit}
PYTEST_ARGS="-v --tb=short"
case $MODE in
  unit)
    echo "=== Tests unitaires (SQLite) ==="
    pytest tests/ --ignore=tests/integration $PYTEST_ARGS
    ;;
  integration)
    echo "=== Tests d integration (Docker requis) ==="
    curl -sf http://localhost:8000/health > /dev/null || {
      echo "API non disponible. Lance : docker compose up -d"
      exit 1
    }
    pytest tests/integration/ $PYTEST_ARGS -m integration
    ;;
  all)
    echo "=== Tous les tests ==="
    curl -sf http://localhost:8000/health > /dev/null || {
      echo "API non disponible pour les tests d integration"
      exit 1
    }
    pytest tests/ $PYTEST_ARGS
    ;;
  *)
    echo "Usage: $0 [unit|integration|all]"
    exit 1
    ;;
esac
