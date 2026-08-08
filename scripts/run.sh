#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Wrapper scripts pour les commandes npm personnalisées
# Utilisation : bash scripts/<commande>.sh
# Ou ajoutez manuellement dans package.json :
#   "migrate": "drizzle-kit push",
#   "seed": "bash scripts/seed.sh",
#   "db:push": "drizzle-kit push",
#   "db:studio": "drizzle-kit studio",
#   "db:generate": "drizzle-kit generate",
# ─────────────────────────────────────────────────────────────

case "$1" in
  migrate|db:push)
    echo "▶ Migration (drizzle-kit push)..."
    npx drizzle-kit push
    ;;
  db:generate)
    echo "▶ Génération migrations..."
    npx drizzle-kit generate
    ;;
  db:studio)
    echo "▶ Drizzle Studio..."
    npx drizzle-kit studio
    ;;
  seed)
    bash scripts/seed.sh "${@:2}"
    ;;
  *)
    echo "Usage: bash scripts/run.sh [migrate|seed|db:push|db:studio|db:generate]"
    exit 1
    ;;
esac
