#!/bin/bash
# ─────────────────────────────────────────────────────────────
# KasayiMultiBusiness ERP — Script d'initialisation automatique
# Usage : bash scripts/seed.sh
# ─────────────────────────────────────────────────────────────
set -e

BASE_URL="${1:-http://localhost:3000}"

echo "╗"
echo "║  KasayiMultiBusiness ERP — Initialisation"
echo "║  Serveur : $BASE_URL"
echo "╝"
echo ""

# 1. Vérifier que le serveur répond
echo "▶ Vérification du serveur..."
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" | grep -q "200"; then
  echo "❌ Serveur non accessible sur $BASE_URL"
  echo "   Démarrez le serveur : npm run dev  (ou npm start)"
  exit 1
fi
echo "✅ Serveur accessible"
echo ""

# 2. Setup (rôles + permissions + entreprise + utilisateurs)
echo "▶ Initialisation (rôles, permissions, entreprise)..."
curl -s -X POST "$BASE_URL/api/setup" | head -c 100
echo ""

# 3. Initialiser mots de passe agents
echo "▶ Initialisation mots de passe agents..."
curl -s -X POST "$BASE_URL/api/auth/staff/init" | head -c 100
echo ""

# 4. Données de démonstration
echo "▶ Chargement des données Agriculture..."
curl -s -X POST "$BASE_URL/api/agriculture/seed" | head -c 80
echo ""

echo "▶ Chargement Production agricole..."
curl -s -X POST "$BASE_URL/api/agriculture/seed-production" | head -c 80
echo ""

echo "▶ Chargement Modules (RH, Comptabilité, Commerce, Transport, ST, Traiteur)..."
curl -s -X POST "$BASE_URL/api/seed-modules" | head -c 80
echo ""

echo "▶ Chargement Articles..."
curl -s -X POST "$BASE_URL/api/seed-content" | head -c 80
echo ""

echo "▶ Chargement Services (site public)..."
curl -s -X POST "$BASE_URL/api/seed-services" | head -c 80
echo ""

echo "▶ Chargement Transport détaillé..."
curl -s -X POST "$BASE_URL/api/transport/seed" | head -c 80
echo ""

echo "▶ Chargement Sous-traitance détaillé..."
curl -s -X POST "$BASE_URL/api/sous-traitance/seed" | head -c 80
echo ""

echo "▶ Chargement Traiteur détaillé..."
curl -s -X POST "$BASE_URL/api/traiteur/seed" | head -c 80
echo ""

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ INITIALISATION TERMINÉE                      ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║                                                  ║"
echo "║  Site public    : $BASE_URL"
echo "║  ERP Back-office: $BASE_URL/login"
echo "║                                                  ║"
echo "║  Agent admin    : admin@kasayimulti.cd           ║"
echo "║  Mot de passe   : admin123                       ║"
echo "║                                                  ║"
echo "║  ⚠️ Changez le mot de passe après connexion !    ║"
echo "╚══════════════════════════════════════════════════╝"
