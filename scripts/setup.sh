#!/bin/bash
# ─────────────────────────────────────────────────────────────
# KasayiMultiBusiness ERP — Setup complet
# Exécute : npm install → drizzle push → build → seed
# Usage : bash scripts/setup.sh
# ─────────────────────────────────────────────────────────────
set -e

echo "╗"
echo "║  KasayiMultiBusiness ERP — Setup complet"
echo "╝"
echo ""

# 1. Vérifier .env
if [ ! -f .env ]; then
  echo "▶ Création du fichier .env depuis .env.example..."
  cp .env.example .env
  echo "⚠️  Éditez .env avec vos paramètres PostgreSQL, puis relancez ce script."
  exit 1
fi

# 2. npm install
echo "▶ Installation des dépendances..."
npm install

# 3. Migration DB
echo "▶ Création des tables (71 tables)..."
npx drizzle-kit push

# 4. Build
echo "▶ Build production..."
npm run build

# 5. Démarrage
echo "▶ Démarrage du serveur..."
npm start &
SERVER_PID=$!
sleep 5

# 6. Seed
echo "▶ Chargement des données..."
bash scripts/seed.sh

# 7. Stop
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ SETUP TERMINÉ                                ║"
echo "║                                                  ║"
echo "║  Démarrez avec : npm start                       ║"
echo "║  Site : http://localhost:3000                     ║"
echo "║  ERP  : http://localhost:3000/login               ║"
echo "║  Login : admin@kasayimulti.cd / admin123         ║"
echo "╚══════════════════════════════════════════════════╝"
