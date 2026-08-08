# Architecture — KasayiMultiBusiness ERP

## Stack technique

| Couche | Technologie | Version |
|---|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript | 16.x |
| Styling | Tailwind CSS v4 | 4.x |
| Graphiques | Recharts | latest |
| Backend | Next.js API Routes | 16.x |
| ORM | Drizzle ORM | 0.45.x |
| Base de données | PostgreSQL | 15+ |
| Auth | bcryptjs + HMAC-SHA256 (custom) | custom |
| PDF | PDFKit | latest |
| Excel | SheetJS (xlsx) | latest |
| IA | Multi-provider (Gemini, OpenAI, Claude, Mistral, Ollama) | custom |

## Structure des dossiers

```
src/
├── app/
│   ├── (public)/          # Site public (layout public + 12 pages)
│   ├── (erp)/             # Back-office ERP (layout ERP + 35 pages)
│   ├── login/             # Connexion/inscription agent
│   ├── api/               # 60+ routes API
│   └── layout.tsx         # Layout racine (html, body, fonts)
├── components/
│   ├── agriculture/       # Composants module agriculture
│   ├── erp/               # Composants ERP (forms, actions)
│   ├── public/            # Composants site public
│   └── ai/                # Widget IA
├── lib/
│   ├── ai/                # Infrastructure IA (types, providers, service, tools)
│   ├── agriculture/       # Services agriculture (stock, production)
│   ├── transport/         # Analyse transport
│   ├── soustraitance/     # Analyse sous-traitance
│   ├── traiteur/          # Analyse traiteur
│   ├── public/            # Données site public
│   ├── auth.ts            # Auth (clients + agents)
│   ├── bilan.ts           # Moteur de bilan consolidé (20 sources)
│   ├── fiscal.ts          # Calculs fiscaux RDC (TVA, CNSS, IPR, IBP)
│   ├── currency.ts        # Multi-devises
│   ├── permissions.ts     # Rôles & permissions
│   ├── pdf.ts             # Génération PDF
│   ├── format.ts          # Formatage (fr-CD, Africa/Lubumbashi)
│   └── slug.ts            # Slugification
└── db/
    ├── schema.ts          # Schéma Drizzle (74 tables)
    └── index.ts           # Pool PostgreSQL
```

## Flux de sécurité

```
Toute requête HTTP
       ↓
middleware.ts (Edge)
├── Pages publiques → laisse passer
├── API publiques (health, services, etc.) → laisse passer
├── Pages ERP (/dashboard, /agriculture...) → vérifie cookie kmb_staff
│   └── Pas de session → redirect /login
└── API protégées (/api/agriculture, etc.) → vérifie cookie kmb_staff
    └── Pas de session → 401 JSON
```

## Authentification

| Type | Cookie | Méthode | Durée |
|---|---|---|---|
| Agent (ERP) | `kmb_staff` | bcrypt + HMAC-SHA256 | 30 jours |
| Client (site public) | `kmb_session` | bcrypt + HMAC-SHA256 | 30 jours |

## Flux IA

```
ChatWidget (frontend)
  ↓ POST /api/ai/chat
API (auth + rate limit 20/min)
  ↓
AIService.generateIntelligentResponse()
  ↓ Détection d'intention (18 patterns)
ERP Tools (15 outils PostgreSQL)
  ↓ Réponse en Markdown avec données réelles
Sauvegarde (ai_conversation + ai_message)
```
