# 🌱 KasayiMultiBusiness ERP

ERP multi-activités pour la RD Congo — Agriculture, Commerce, Transport, Sous-traitance, Service traiteur, RH, Comptabilité SYSCOHADA.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue) ![Drizzle](https://img.shields.io/badge/Drizzle-ORM-orange)

---

## 📋 Prérequis

| Logiciel | Version | Lien |
|---|---|---|
| **Node.js** | ≥ 20 LTS (recommandé 22) | https://nodejs.org |
| **PostgreSQL** | ≥ 15 (recommandé 16) | https://www.postgresql.org/download/ |
| **npm** | ≥ 10 (inclus avec Node.js) | — |
| **Git** | dernière version | https://git-scm.com |

---

## 🚀 Installation rapide (5 étapes)

### Étape 1 : Cloner / extraire le projet
```bash
cd C:\Users\TonNom\Documents
# Si ZIP : extraire le dossier
# Si Git : git clone https://github.com/votre-compte/kasayi-erp.git
cd kasayi-erp
```

### Étape 2 : Configurer la base de données
```bash
# Créer la base PostgreSQL
psql -U postgres -c "CREATE DATABASE kasayi_erp;"

# Copier le fichier .env
cp .env.example .env
# Éditer .env et vérifier DATABASE_URL
# DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/kasayi_erp
```

### Étape 3 : Installer les dépendances
```bash
npm install
```

### Étape 4 : Créer les tables (71 tables)
```bash
npx drizzle-kit push
```

### Étape 5 : Démarrer + charger les données
```bash
# Terminal 1 : démarrer le serveur
npm run dev

# Terminal 2 : charger les données de démo (serveur doit tourner)
bash scripts/seed.sh
```

---

## 🎉 C'est prêt !

| URL | Description |
|---|---|
| **http://localhost:3000** | 🌐 Site public |
| **http://localhost:3000/login** | 🔐 Connexion ERP |
| **http://localhost:3000/connexion** | 👤 Espace client |
| **http://localhost:3000/dashboard** | 📊 Tableau de bord ERP |

### Compte administrateur par défaut
```
Email         : admin@kasayimulti.cd
Mot de passe  : admin123
```

---

## 📜 Toutes les commandes

### Développement
```bash
npm run dev          # Serveur développement (http://localhost:3000)
npm run build        # Build production
npm start            # Serveur production (après build)
npm run lint         # Vérification ESLint
npm run typecheck    # Vérification TypeScript
```

### Base de données
```bash
npx drizzle-kit push              # Créer/mettre à jour les tables (lit .env automatiquement)
bash scripts/migrate.sh           # Script de migration (alias)
bash scripts/seed.sh              # Charger toutes les données de démo
bash scripts/seed.sh http://VOTRE-SERVER:3000  # Seed sur serveur distant
bash scripts/setup.sh             # Setup complet (install + migrate + build + seed en un)
```

### Avec Makefile (raccourcis)
```bash
make install     # = npm install
make dev         # = npm run dev
make build       # = npm run build
make migrate     # = npx drizzle-kit push
make seed        # = bash scripts/seed.sh
make docker-up   # = docker-compose up -d --build
make docker-down # = docker-compose down
```

### Données de démonstration (URLs individuelles)
```bash
# À exécuter une par une dans le navigateur ou avec curl :
curl -X POST http://localhost:3000/api/setup
curl -X POST http://localhost:3000/api/auth/staff/init
curl -X POST http://localhost:3000/api/agriculture/seed
curl -X POST http://localhost:3000/api/agriculture/seed-production
curl -X POST http://localhost:3000/api/seed-modules
curl -X POST http://localhost:3000/api/seed-content
curl -X POST http://localhost:3000/api/seed-services
curl -X POST http://localhost:3000/api/transport/seed
curl -X POST http://localhost:3000/api/sous-traitance/seed
curl -X POST http://localhost:3000/api/traiteur/seed
```

---

## 🐳 Docker (optionnel)

### Avec Docker Compose (recommandé)
```bash
# Tout en un : PostgreSQL + Application
docker-compose up -d

# L'application est disponible sur http://localhost:3000
# Initialiser les données :
docker-compose exec app bash scripts/seed.sh
```

### Avec Docker seul
```bash
docker build -t kasayi-erp .
docker run -p 3000:3000 -e DATABASE_URL=postgresql://... kasayi-erp
```

---

## ☁️ Déploiement

### Option 1 : Vercel + Neon (GRATUIT)
1. **GitHub** : poussez le code sur GitHub
2. **Neon** : créez une base PostgreSQL gratuite sur https://neon.tech
3. **Vercel** : https://vercel.com → Import Project → Ajoutez `DATABASE_URL` et `SESSION_SECRET`
4. Déployez → initialisez avec `bash scripts/seed.sh https://VOTRE-SITE.vercel.app`

### Option 2 : Railway
1. https://railway.app → New Project → Deploy from GitHub
2. Ajoutez PostgreSQL → copiez `DATABASE_URL`
3. Variables : `DATABASE_URL`, `SESSION_SECRET`
4. Déployez → initialisez les données

### Option 3 : VPS Ubuntu (Nginx + PM2)
```bash
# Sur le VPS
git clone https://github.com/votre-compte/kasayi-erp.git
cd kasayi-erp
npm install
cp .env.example .env  # éditer DATABASE_URL + SESSION_SECRET
npx drizzle-kit push
npm run build
npm install -g pm2
pm2 start npm --name kasayi-erp -- start
pm2 save && pm2 startup

# Nginx
sudo nano /etc/nginx/sites-available/kasayi-erp
```
Configuration Nginx :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/kasayi-erp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d votre-domaine.com  # SSL gratuit
```

---

## 📁 Structure du projet

```
kasayi-erp/
├── src/
│   ├── app/
│   │   ├── (public)/          # Site public (accueil, activités, équipe...)
│   │   ├── (erp)/             # Back-office ERP (dashboard, modules...)
│   │   ├── login/             # Connexion agent (login + inscription)
│   │   └── api/               # 55+ routes API sécurisées
│   ├── components/            # Composants réutilisables
│   ├── lib/                   # Logique métier (fiscal, bilan, auth...)
│   └── db/
│       ├── schema.ts          # Schéma Drizzle (71 tables)
│       └── index.ts           # Connexion PostgreSQL
├── public/images/             # Dossier images locales
├── scripts/
│   ├── migrate.sh             # Migration base de données
│   └── seed.sh                # Initialisation données démo
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── drizzle.config.json
├── next.config.ts
└── package.json
```

---

## 🛠️ Solutions aux erreurs fréquentes

### Erreur : `DATABASE_URL is required`
→ Créez le fichier `.env` : `cp .env.example .env`

### Erreur : `relation "xxx" does not exist`
→ Exécutez la migration : `npx drizzle-kit push`

### Erreur : `ECONNREFUSED 127.0.0.1:5432`
→ PostgreSQL n'est pas démarré. Démarrez-le :
```bash
# Windows : démarrer le service PostgreSQL
# Linux : sudo systemctl start postgresql
# Mac : brew services start postgresql
```

### Erreur : `password authentication failed`
→ Vérifiez le mot de passe PostgreSQL dans `.env`

### Page blanche / erreur 500
→ Vérifiez que la base est initialisée : `bash scripts/seed.sh`

### Images ne s'affichent pas
→ Vérifiez votre connexion internet (images externes Pexels)
→ Ou placez vos images dans `public/images/` et modifiez les URLs via `/admin/medias`

### Port 3000 déjà utilisé
→ Changez le port : `PORT=3001 npm run dev`

---

## 📊 Modules ERP (71 tables)

| Module | Tables | Fonctionnalités clés |
|---|---|---|
| 🌱 Agriculture | 10 | Stock CMUP + alertes, parcelles, cultures, récoltes, ventes, analyse |
| 🚚 Transport | 9 | Véhicules, missions, carburant (conso L/100km), entretiens, bénéfices |
| 🏗️ Sous-traitance | 8 | Projets, contrats, suivi avancement, budget, bénéfices prévu/réel |
| 🍽️ Traiteur | 8 | Événements, menus, stock alimentaire CMUP, factures TVA |
| 🛒 Commerce | 4 | Articles + marges, ventes TVA, paiements interactifs |
| 👥 RH | 6 | Employés complets, documents, congés, présences, paie PDF |
| 💰 Comptabilité | 6 | Caisse/banque, mouvements, créances/dettes |
| 📊 Pilotage | 3 | Bilan consolidé, finances transversales, rapports |
| 🔐 Admin | 10 | Users, rôles, permissions, contenu, médias, taxes |
| 🌐 Public | 7 | Services, articles, FAQ, clients, newsletter, contact |

---

## 🔐 Sécurité

- Mots de passe hachés (bcrypt)
- Sessions httpOnly signées (HMAC-SHA256)
- Blocage après 5 tentatives échouées (15 min)
- Middleware : toutes les routes financières protégées (401 sans session)
- Le site public ne expose **aucune donnée financière**

---

## 📄 Licence

MIT — Voir le fichier [LICENSE](LICENSE)

---

## 👨‍💼 Auteur

**KasayiMultiBusiness** — Entreprise multi-activités, Kasaï Central, Kananga, RD Congo.
