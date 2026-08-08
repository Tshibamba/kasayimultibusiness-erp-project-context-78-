# 🚀 Guide de déploiement — KasayiMultiBusiness ERP

Ce guide détaille le déploiement sur **4 plateformes**. Choisissez celle qui vous convient.

---

## 📋 Prérequis communs

| Élément | Valeur |
|---|---|
| Compte admin | `admin@kasayimulti.cd` / `admin123` |
| Variables obligatoires | `DATABASE_URL`, `SESSION_SECRET` |
| Base de données | PostgreSQL 15+ |

**Générer SESSION_SECRET** (sur votre PC) :
```bash
openssl rand -base64 32
# Copiez le résultat
```

---

## ☁️ Option 1 : Vercel + Neon (GRATUIT — recommandé)

### Avantages
- 100 % gratuit (100 Go de bande passante/mois)
- Déploiement automatique depuis GitHub
- Base PostgreSQL gratuite (0,5 Go)

### Étape 1 : Préparer le code sur GitHub
```bash
# Sur votre PC
git init
git add .
git commit -m "KasayiMultiBusiness ERP"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/kasayi-erp.git
git push -u origin main
```

### Étape 2 : Créer la base Neon
1. Allez sur **https://neon.tech** → Sign up (avec GitHub)
2. **New Project** → Nom : `kasayi-erp`
3. Copiez la **connection string** :
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### Étape 3 : Déployer sur Vercel
1. Allez sur **https://vercel.com** → Sign up (avec GitHub)
2. **Add New → Project** → Sélectionnez `kasayi-erp`
3. **Settings → Environment Variables** → Ajoutez :

| Name | Value |
|---|---|
| `DATABASE_URL` | *(collez la connection string Neon)* |
| `SESSION_SECRET` | *(votre clé générée avec openssl)* |

4. **Deploy** → attendez ~2 minutes

### Étape 4 : Initialiser les données
```bash
# Ouvrez ces URL dans votre navigateur, une par une :
https://VOTRE-SITE.vercel.app/api/setup
https://VOTRE-SITE.vercel.app/api/auth/staff/init
https://VOTRE-SITE.vercel.app/api/agriculture/seed
https://VOTRE-SITE.vercel.app/api/agriculture/seed-production
https://VOTRE-SITE.vercel.app/api/seed-modules
https://VOTRE-SITE.vercel.app/api/seed-content
https://VOTRE-SITE.vercel.app/api/seed-services
https://VOTRE-SITE.vercel.app/api/transport/seed
https://VOTRE-SITE.vercel.app/api/sous-traitance/seed
https://VOTRE-SITE.vercel.app/api/traiteur/seed
```

Ou en une commande :
```bash
bash scripts/seed.sh https://VOTRE-SITE.vercel.app
```

### Étape 5 : C'est en ligne ! 🎉
```
Site public : https://VOTRE-SITE.vercel.app
ERP         : https://VOTRE-SITE.vercel.app/login
Agent       : admin@kasayimulti.cd / admin123
```

### ⚠️ Vercel : notes importantes
- Le `output: "standalone"` dans `next.config.ts` est compatible Vercel
- Le middleware de sécurité fonctionne nativement
- Les uploads de fichiers doivent utiliser un service externe (Vercel n'a pas de système de fichiers persistant)

---

## 🚂 Option 2 : Railway

### Avantages
- Base PostgreSQL + Application sur la même plateforme
- Déploiement depuis GitHub automatique

### Étape 1 : Créer le projet
1. **https://railway.app** → Login with GitHub
2. **New Project → Deploy from GitHub Repo** → Sélectionnez `kasayi-erp`

### Étape 2 : Ajouter PostgreSQL
1. **+ Add → Database → PostgreSQL**
2. Copiez l'URL de connexion (Variables → `DATABASE_URL`)

### Étape 3 : Variables d'environnement
Dans **Settings → Variables** de votre service app :

| Name | Value |
|---|---|
| `DATABASE_URL` | *(URL PostgreSQL de Railway)* |
| `SESSION_SECRET` | *(clé aléatoire)* |

### Étape 4 : Build settings
- **Build Command** : `npm run build`
- **Start Command** : `npm start`

### Étape 5 : Initialiser
```bash
# Railway donne une URL du type : https://kasayi-erp.up.railway.app
bash scripts/seed.sh https://kasayi-erp.up.railway.app
```

---

## 🎨 Option 3 : Render

### Étape 1 : Base de données
1. **https://render.com** → New → PostgreSQL
2. Nom : `kasayi-erp` → Create
3. Copiez la **Internal Database URL**

### Étape 2 : Web Service
1. **New → Web Service** → Connect GitHub → `kasayi-erp`
2. Settings :
   - **Runtime** : Node
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm start`
3. **Environment Variables** :

| Key | Value |
|---|---|
| `DATABASE_URL` | *(Internal DB URL de Render)* |
| `SESSION_SECRET` | *(clé aléatoire)* |

4. **Create Web Service**

### Étape 3 : Initialiser
```bash
bash scripts/seed.sh https://kasayi-erp.onrender.com
```

---

## 🖥️ Option 4 : VPS Ubuntu (Nginx + PM2)

### Avantages
- Contrôle total
- ~6€/mois (Hetzner CX21)
- Pas de limite de trafic

### Étape 1 : Préparer le VPS
```bash
# Connexion SSH
ssh root@VOTRE-IP

# Mise à jour
apt update && apt upgrade -y

# Installer Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

# Installer PostgreSQL 16
sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
apt update && apt install -y postgresql-16

# Installer Nginx + Certbot
apt install -y nginx certbot python3-certbot-nginx

# Installer PM2
npm install -g pm2
```

### Étape 2 : Configurer PostgreSQL
```bash
sudo -u postgres psql << 'SQL'
CREATE DATABASE kasayi_erp;
CREATE USER kasayi WITH ENCRYPTED PASSWORD 'VOTRE_MOT_DE_PASSE';
GRANT ALL PRIVILEGES ON DATABASE kasayi_erp TO kasayi;
SQL
```

### Étape 3 : Cloner et build
```bash
cd /var/www
git clone https://github.com/VOTRE-COMPTE/kasayi-erp.git
cd kasayi-erp

# Créer .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://kasayi:VOTRE_MOT_DE_PASSE@localhost:5432/kasayi_erp
SESSION_SECRET=VOTRE_CLE_SECRETE_TRES_LONGUE
NODE_ENV=production
PORT=3000
EOF

# Installer et build
npm install
npx drizzle-kit push
npm run build
```

### Étape 4 : Démarrer avec PM2
```bash
pm2 start npm --name "kasayi-erp" -- start
pm2 save
pm2 startup
# Suivez les instructions affichées par pm2 startup
```

### Étape 5 : Configurer Nginx
```bash
cat > /etc/nginx/sites-available/kasayi-erp << 'NGINX'
server {
    listen 80;
    server_name VOTRE-DOMAINE.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Taille max pour uploads
    client_max_body_size 10M;
}
NGINX

ln -s /etc/nginx/sites-available/kasayi-erp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### Étape 6 : SSL gratuit (Let's Encrypt)
```bash
certbot --nginx -d VOTRE-DOMAINE.com
# Suivez les instructions (choisir redirect HTTP → HTTPS)
```

### Étape 7 : Initialiser les données
```bash
bash scripts/seed.sh http://localhost:3000
```

### Étape 8 : C'est en ligne ! 🎉
```
Site public : https://VOTRE-DOMAINE.com
ERP         : https://VOTRE-DOMAINE.com/login
```

### VPS : Commandes de maintenance
```bash
# Voir les logs
pm2 logs kasayi-erp

# Redémarrer
pm2 restart kasayi-erp

# Mettre à jour le code
cd /var/www/kasayi-erp
git pull
npm install
npm run build
pm2 restart kasayi-erp

# Sauvegarde automatique PostgreSQL (cron)
crontab -e
# Ajouter : 0 3 * * * pg_dump -U kasayi kasayi_erp > /backup/kasayi_$(date +\%Y\%m\%d).sql
```

---

## 🐳 Option 5 : Docker (toutes plateformes)

### Une seule commande
```bash
docker-compose up -d
```

Cela démarre :
- **PostgreSQL 16** sur le port 5432
- **L'application ERP** sur le port 3000

### Initialiser les données
```bash
docker-compose exec app bash scripts/seed.sh http://localhost:3000
```

### Arrêter
```bash
docker-compose down
```

---

## 🔧 Dépannage déploiement

### Erreur : `DATABASE_URL is required`
→ Ajoutez la variable dans les paramètres de la plateforme.

### Erreur : `relation "xxx" does not exist`
→ Exécutez `npx drizzle-kit push` avec la bonne `DATABASE_URL`.

### Erreur : `pdfkit` sur Vercel
→ `serverExternalPackages: ["pdfkit"]` est déjà dans `next.config.ts`.

### Page 500 après déploiement
→ Vérifiez que le seed a été exécuté : `bash scripts/seed.sh https://VOTRE-SITE`.

### SSL sur Neon
→ Ajoutez `?sslmode=require` à la fin de votre `DATABASE_URL` Neon.

---

## 📊 Comparatif des plateformes

| Plateforme | Coût | Setup | SSL | Persistance fichiers |
|---|---|---|---|---|
| **Vercel + Neon** | Gratuit | 10 min | Auto | Non (utiliser URLs externes) |
| **Railway** | $5/mois | 5 min | Auto | Oui |
| **Render** | $7/mois | 10 min | Auto | Oui |
| **VPS Hetzner** | €6/mois | 30 min | Certbot | Oui (complet) |
| **Docker** | Variable | 2 min | Via proxy | Oui (volumes) |

---

## ✅ Checklist finale (toutes plateformes)

- [ ] `DATABASE_URL` configuré ✅
- [ ] `SESSION_SECRET` configuré ✅
- [ ] `npx drizzle-kit push` exécuté ✅
- [ ] `bash scripts/seed.sh` exécuté ✅
- [ ] `admin@kasayimulti.cd` connecté ✅
- [ ] Mot de passe admin changé ✅
- [ ] HTTPS/SSL actif ✅
