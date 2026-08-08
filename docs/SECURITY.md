# Sécurité — KasayiMultiBusiness ERP

## Authentification

### Agents (ERP)
- **Hachage** : bcrypt (10 rounds)
- **Session** : cookie httpOnly `kmb_staff`, signé HMAC-SHA256
- **Blocage** : après 5 tentatives incorrectes → 15 minutes
- **Historique** : toutes les tentatives enregistrées (table `login_history`)
- **Inscription** : comptes créés inactifs (admin doit activer)

### Clients (site public)
- **Hachage** : bcrypt (10 rounds)
- **Session** : cookie httpOnly `kmb_session`, signé HMAC-SHA256
- **Protection** : routes client protégées par cookie

## Middleware (Edge)

Le middleware `src/middleware.ts` protège :
- ✅ Toutes les pages ERP (`/dashboard`, `/agriculture`, `/transport`, etc.)
- ✅ Toutes les API financières (`/api/agriculture`, `/api/commerce`, etc.)
- ❌ Ne protège PAS : pages publiques, API publiques, assets statiques

## Permissions (RG02)

7 rôles avec permissions par module :
1. **Super Admin** — accès total
2. **Directeur** — lecture + validation
3. **Responsable** — gestion de son module
4. **Comptable** — comptabilité + lecture
5. **Caissier** — trésorerie uniquement
6. **Agent de saisie** — saisie uniquement
7. **Auditeur** — lecture seule

## Données sensibles protégées

| Donnée | Exposée au public ? | Protection |
|---|---|---|
| Salaires | ❌ Jamais | Middleware + page publique sans champ salaire |
| Bénéfices | ❌ Jamais | Middleware 401 sur toutes les routes financières |
| Stocks | ❌ Jamais | Middleware |
| Données employés | ❌ Sauf nom/fonction/grade | Page /equipe filtre les colonnes |

## Variables d'environnement critiques

| Variable | Usage | Danger si exposée |
|---|---|---|
| `DATABASE_URL` | Connexion PostgreSQL | Accès total DB |
| `SESSION_SECRET` | Signature HMAC | Vol de sessions |
| `GEMINI_API_KEY` | IA (facturation) | Usage facturé |

⚠️ **Ne jamais committer `.env` dans Git** (déjà dans `.gitignore`)

## Recommandations production

1. Changer `SESSION_SECRET` (générer avec `openssl rand -base64 32`)
2. Changer le mot de passe admin (`admin123` → mot de passe fort)
3. Activer HTTPS (Let's Encrypt sur VPS, automatique sur Vercel)
4. Sauvegardes PostgreSQL quotidiennes (`pg_dump`)
5. Surveiller les logs d'erreur
