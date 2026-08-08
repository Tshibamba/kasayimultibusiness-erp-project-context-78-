# 🤖 Assistant IA — KasayiMultiBusiness ERP

## Architecture

```
Frontend (ChatWidget)
    ↓ POST /api/ai/chat
API Route (auth + rate limit)
    ↓
AIService (src/lib/ai/service.ts)
    ↓
AIProvider (src/lib/ai/providers.ts)
    ↓
Fournisseur réel (Gemini / OpenAI / Claude / Mistral / Ollama)
```

## Installation

Aucune installation supplémentaire requise. L'assistant IA fonctionne **immédiatement en mode démo** (sans clé API).

Pour activer l'IA réelle, ajoutez une clé dans `.env` :

```env
GEMINI_API_KEY=votre_cle_google_gemini
```

Obtenez une clé gratuite : https://aistudio.google.com/apikey

## Changement de fournisseur

1. Ajoutez la clé du fournisseur dans `.env`
2. Modifiez le paramètre `provider` via l'API ou la base (table `ai_setting`)
3. Redémarrez

Fournisseurs supportés :

| Fournisseur | Variable .env | Obtenir une clé |
|---|---|---|
| Google Gemini (défaut) | `GEMINI_API_KEY` | https://aistudio.google.com/apikey |
| OpenAI | `OPENAI_API_KEY` | https://platform.openai.com/api-keys |
| Anthropic Claude | `ANTHROPIC_API_KEY` | https://console.anthropic.com |
| OpenRouter | `OPENROUTER_API_KEY` | https://openrouter.ai |
| Mistral | `MISTRAL_API_KEY` | https://console.mistral.ai |
| Ollama (local) | `OLLAMA_HOST` | https://ollama.ai |

## Sécurité

- Authentification obligatoire (agent ou client connecté)
- Rate limiting : 20 requêtes/minute par utilisateur
- Le middleware protège `/api/ai/*` (sauf exclusion pour le chat authentifié)
- Journalisation : toutes les conversations sont enregistrées (table `ai_message`)
- Aucune donnée métier n'est exposée à l'IA (par défaut)

## Tables de données

| Table | Rôle |
|---|---|
| `ai_conversation` | Conversations (titre, utilisateur, timestamps) |
| `ai_message` | Messages (rôle, contenu, provider, tokens, latence) |
| `ai_setting` | Configuration (provider, modèle, température, system prompt) |

## Mode démo

Sans clé API configurée, l'assistant répond avec des messages simulés contextuels. Permet de tester l'interface sans coût.
