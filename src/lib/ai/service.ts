// ─────────────────────────────────────────────────────────────
// AI Service — Couche d'abstraction principale
// Frontend → API → AIService → Provider
// ─────────────────────────────────────────────────────────────

import { db } from "@/db";
import { aiConversation, aiMessage, aiSetting } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createProvider, type AIProvider } from "./providers";
import { PROVIDERS, type AIProviderName, type ChatMessage, type ChatRequest, type ChatResponse } from "./types";
import { toolChiffreAffaires, toolStockFaible, toolImpayes, toolRentabilite, toolBenefices, toolEmployesAbsents, toolVehiculesEntretien, toolDepensesTransport, toolTopVentes, toolResumeGlobal, toolAlertes, toolFournisseursRetard, toolRecommandations, toolAnomalies, toolVentesMoisPasse } from "./erp-tools";

// ── Rate limiting (en mémoire, simple) ───────────────────────
const requestLog = new Map<number, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = requestLog.get(userId);
  if (!entry || now > entry.resetAt) {
    requestLog.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) return false;
  entry.count++;
  return true;
}

// ── Configuration centrale ───────────────────────────────────
export async function getAIConfig() {
  const settings = await db.select().from(aiSetting);
  const map = new Map(settings.map(s => [s.key, s.value]));
  return {
    provider: (map.get("provider") || "gemini") as AIProviderName,
    model: map.get("model") || PROVIDERS.gemini.defaultModel,
    systemPrompt: map.get("system_prompt") || `Tu es l'assistant IA de KasayiMultiBusiness ERP. Tu aides les agents de l'entreprise dans leurs tâches quotidiennes. Réponds en français, de manière claire et professionnelle. Utilise le Markdown pour formater tes réponses.`,
    temperature: Number(map.get("temperature") || 0.7),
    maxTokens: Number(map.get("max_tokens") || 4096),
  };
}

// ── Récupère la clé API du provider actif ────────────────────
function getApiKey(provider: AIProviderName): string {
  const config = PROVIDERS[provider];
  return process.env[config.apiKeyEnv] || "";
}

// ── Chat principal ───────────────────────────────────────────
export async function chat(req: ChatRequest, user: { id: number; name: string; role?: string }): Promise<ChatResponse> {
  const start = Date.now();

  // Rate limit
  if (!checkRateLimit(user.id)) {
    throw new Error("Limite de requêtes atteinte (20/min). Réessayez dans un instant.");
  }

  const config = await getAIConfig();
  const apiKey = getApiKey(config.provider);

  // Mode démo : si pas de clé API, retourner une réponse simulée
  if (!apiKey && config.provider !== "ollama") {
    const simulated = await generateIntelligentResponse(req.messages, user);
    const conversationId = await saveConversation(req, user, simulated, config.provider, start);
    return {
      content: simulated,
      provider: config.provider,
      latencyMs: Date.now() - start,
      conversationId,
    };
  }

  // Créer le provider
  const provider: AIProvider = createProvider(config.provider, apiKey, config.model);

  // Préparer les messages avec system prompt
  const messages: ChatMessage[] = [
    { role: "system", content: config.systemPrompt + `\n\nContexte utilisateur : ${user.name} (${user.role || "agent"}).` },
    ...req.messages,
  ];

  // Appeler le provider
  const result = await provider.chat(messages, {
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  // Sauvegarder en DB
  const conversationId = await saveConversation(req, user, result.content, config.provider, start, result.tokensUsed);

  return {
    content: result.content,
    provider: config.provider,
    tokensUsed: result.tokensUsed,
    latencyMs: Date.now() - start,
    conversationId,
  };
}

// ── Sauvegarde conversation + messages ───────────────────────
async function saveConversation(
  req: ChatRequest,
  user: { id: number; name: string; role?: string },
  response: string,
  provider: AIProviderName,
  startTime: number,
  tokens?: number,
): Promise<number> {
  const lastUserMsg = req.messages.filter(m => m.role === "user").pop();
  const title = lastUserMsg ? lastUserMsg.content.slice(0, 80) : "Conversation";

  let conversationId = req.conversationId;
  if (!conversationId) {
    const [conv] = await db.insert(aiConversation).values({
      userId: user.id,
      userRole: user.role || "agent",
      userName: user.name,
      title,
    }).returning();
    conversationId = conv.id;
  } else {
    await db.update(aiConversation).set({ updatedAt: new Date() }).where(eq(aiConversation.id, conversationId));
  }

  // Sauvegarder le dernier message utilisateur
  if (lastUserMsg) {
    await db.insert(aiMessage).values({
      conversationId,
      role: "user",
      content: lastUserMsg.content,
    });
  }

  // Sauvegarder la réponse
  await db.insert(aiMessage).values({
    conversationId,
    role: "assistant",
    content: response,
    provider,
    tokensUsed: tokens,
    latencyMs: Date.now() - startTime,
  });

  return conversationId;
}

// ── Détection d'intention + accès données ERP ────────────────
async function generateIntelligentResponse(messages: ChatMessage[], user: { name: string; role?: string }): Promise<string> {
  const lastMsg = messages.filter(m => m.role === "user").pop()?.content.toLowerCase() || "";
  const q = lastMsg.trim();

  // Détection d'intention
  if (q.match(/bonjour|salut|hello|bonsoir|coucou/)) {
    return `Bonjour **${user.name}** ! 👋\n\nJe suis l'assistant intelligent de KasayiMultiBusiness ERP.\n\nJe peux analyser les données de **tous les modules** :\n- 📊 *\"Quel est le chiffre d'affaires du mois ?\"*\n- 🔔 *\"Quels produits sont en rupture ?\"*\n- 💰 *\"Quelles factures sont impayées ?\"*\n- 📈 *\"Quelle activité est la plus rentable ?\"*\n- 👥 *\"Quels employés sont absents ?\"*\n- 🚚 *\"Quels véhicules doivent être entretenus ?\"*\n- 💡 *\"Montre-moi le résumé de l'entreprise\"*\n- 📋 Et bien plus encore !\n\nPosez votre question en langage naturel. 🤖`;
  }

  if (q.match(/chiffre|recette.*mois|combien.*gagn|ca.*mois|revenu.*mois/)) return (await toolChiffreAffaires()).text;
  if (q.match(/rupture|stock.*faible|stock.*bas|alerte.*stock|produit.*manqu/)) return (await toolStockFaible()).text;
  if (q.match(/impay|facture.*non.*pay|cr.ance|client.*doit|facture.*retard/)) return (await toolImpayes()).text;
  if (q.match(/rentab|plus.*rentable|activit.*gagne|quel.*activit/)) return (await toolRentabilite()).text;
  if (q.match(/b.n.fice|benefice|profit|r.sultat.*ann|gagn.*ann/)) return (await toolBenefices()).text;
  if (q.match(/absent|cong|absence|employ.*absent/)) return (await toolEmployesAbsents()).text;
  if (q.match(/entretien|v.hicule.*mainten|camion.*r.par|vehicule.*entreten|v.hicule.*entreten/)) return (await toolVehiculesEntretien()).text;
  if (q.match(/d.pense.*transport|cout.*transport|transport.*d.pense/)) return (await toolDepensesTransport()).text;
  if (q.match(/top.*vente|produit.*vendu|plus.*vendu|meilleur.*produit|produit.*plus.*vente/)) return (await toolTopVentes()).text;
  if (q.match(/résum|resume|global|vue.*ensemble|synthèse|overview|status/)) return (await toolResumeGlobal()).text;
  if (q.match(/alerte|alert|notification|problème|attention|urgent/)) return (await toolAlertes()).text;
  if (q.match(/fournisseur.*retard|retard.*fournisseur|fournisseur.*payer|dette.*fournisseur|payable/)) return (await toolFournisseursRetard()).text;
  if (q.match(/recommand|conseil|suggestion|propose|amélior/)) return (await toolRecommandations()).text;
  if (q.match(/anomal|incohérence|erreur.*donnée|bizarre|problème.*donnée/)) return (await toolAnomalies()).text;
  if (q.match(/vente.*mois.*dernier|recette.*mois.*dernier|mois.*passé|dernier.*mois/)) return (await toolVentesMoisPasse()).text;
  if (q.match(/rapport|génère.*rapport|crée.*rapport|rédige/)) {
    const resume = await toolResumeGlobal();
    const benef = await toolBenefices();
    return `## 📝 Rapport automatique\n\n${resume.text}\n\n---\n\n${benef.text}\n\n---\n\n💡 *Rapport généré automatiquement à partir des données en temps réel. Pour un export PDF/Excel, utilisez le module Bilan financier.*`;
  }

  // Aide contextuelle sur l'ERP
  if (q.match(/comment|aide|guide|explique|tutoriel|où.*trouver|comment.*faire|navig/)) {
    return `## 💡 Aide ERP\n\nVoici les modules disponibles :\n\n| Module | Description | Où ? |\n|---|---|---|\n| 📊 **Tableau de bord** | KPIs + graphiques | Pilotage → Tableau de bord |\n| 📈 **Bilan financier** | Consolidé par activité | Pilotage → Bilan financier |\n| 🌱 **Agriculture** | Stocks, cultures, ventes | Section Agriculture |\n| 🚚 **Transport** | Véhicules, carburant | Section Travaux & services |\n| 🏗️ **Sous-traitance** | Projets, contrats | Section Travaux & services |\n| 🍽️ **Traiteur** | Événements, menus | Section Travaux & services |\n| 🛒 **Commerce** | Articles, ventes | Section Gestion |\n| 👥 **RH** | Employés, paie | Section Gestion |\n| 💰 **Comptabilité** | Caisses, banques | Section Gestion |\n| 🏦 **Finances** | Dépenses/recettes | Pilotage → Finances |\n| 🏛️ **Impôts** | TVA, échéances | Administration |\n\nDemandez-moi n'importe quoi sur ces modules !`;
  }

  // Recherche par mots-clés
  if (q.match(/vente|vendre/)) return await toolChiffreAffaires().then(r => r.text);
  if (q.match(/employ|personnel|rh/)) return await toolResumeGlobal().then(r => r.text);
  if (q.match(/argent|finance|budget/)) return await toolBenefices().then(r => r.text);
  if (q.match(/camion|voiture|transport/)) return await toolResumeGlobal().then(r => r.text);

  // Réponse par défaut intelligente
  return `🤖 Je n'ai pas trouvé de réponse exacte à votre question.\n\n**Voici ce que je peux faire :**\n- 📊 Chiffre d'affaires du mois\n- 🔔 Produits en rupture de stock\n- 💰 Factures impayées\n- 📈 Activité la plus rentable\n- 💰 Bénéfices de l'année\n- 👥 Employés absents\n- 🚚 Véhicules à entretenir\n- 📋 Résumé global\n- 💡 Aide sur l'ERP\n\n*Essayez de reformuler avec ces mots-clés, ou activez l'IA réelle avec GEMINI_API_KEY pour des réponses personnalisées.*`;
}

// ── Historique des conversations ─────────────────────────────
export async function getConversations(userId: number, limit = 20) {
  const conversations = await db.select().from(aiConversation)
    .where(eq(aiConversation.userId, userId))
    .orderBy(desc(aiConversation.updatedAt))
    .limit(limit);
  return conversations;
}

export async function getConversationMessages(conversationId: number) {
  return db.select().from(aiMessage)
    .where(eq(aiMessage.conversationId, conversationId))
    .orderBy(aiMessage.id);
}

// ── Initialisation des paramètres par défaut ─────────────────
export async function initAISettings() {
  const existing = await db.select().from(aiSetting).limit(1);
  if (existing.length > 0) return;

  const defaults = [
    { key: "provider", value: "gemini", description: "Fournisseur IA actif" },
    { key: "model", value: PROVIDERS.gemini.defaultModel, description: "Modèle par défaut" },
    { key: "temperature", value: "0.7", description: "Température (créativité)" },
    { key: "max_tokens", value: "4096", description: "Tokens maximum par réponse" },
    { key: "system_prompt", value: "Tu es l'assistant IA de KasayiMultiBusiness ERP.", description: "Prompt système" },
  ];
  for (const d of defaults) {
    await db.insert(aiSetting).values(d);
  }
}
