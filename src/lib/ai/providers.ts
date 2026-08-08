// ─────────────────────────────────────────────────────────────
// AI Providers — Implémentation de chaque fournisseur
// Chaque provider implémente l'interface AIProvider.
// Pour changer de provider : modifier UNIQUEMENT la config, pas le code.
// ─────────────────────────────────────────────────────────────

import { PROVIDERS, type AIProviderName, type ChatMessage, type ProviderConfig } from "./types";

export interface AIProvider {
  name: AIProviderName;
  config: ProviderConfig;
  chat(messages: ChatMessage[], options: { model?: string; temperature?: number; maxTokens?: number }): Promise<{ content: string; tokensUsed?: number }>;
}

// ── Factory : crée le bon provider selon le nom ──────────────
export function createProvider(name: AIProviderName, apiKey: string, model?: string): AIProvider {
  const config = PROVIDERS[name];
  if (!config) throw new Error(`Provider "${name}" non supporté`);

  switch (name) {
    case "gemini": return new GeminiProvider(config, apiKey, model);
    case "openai": return new OpenAICompatibleProvider(config, apiKey, model);
    case "claude": return new ClaudeProvider(config, apiKey, model);
    case "openrouter": return new OpenAICompatibleProvider(config, apiKey, model);
    case "mistral": return new OpenAICompatibleProvider(config, apiKey, model);
    case "ollama": return new OllamaProvider(config, apiKey, model);
    default: throw new Error(`Provider non implémenté: ${name}`);
  }
}

// ── Gemini (Google) ──────────────────────────────────────────
class GeminiProvider implements AIProvider {
  name: AIProviderName = "gemini";
  config: ProviderConfig;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig, apiKey: string, model?: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.model = model || config.defaultModel;
  }

  async chat(messages: ChatMessage[], options: { temperature?: number }) {
    const systemMsgs = messages.filter(m => m.role === "system");
    const systemText = systemMsgs.map(m => m.content).join("\n");
    const contents = messages.filter(m => m.role !== "system").map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const body: Record<string, unknown> = { contents, generationConfig: { temperature: options.temperature ?? 0.7 } };
    if (systemText) body.systemInstruction = { parts: [{ text: systemText }] };

    const res = await fetch(`${this.config.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.map((p: { text: string }) => p.text).join("") || "Réponse vide.";
    return { content, tokensUsed: data.usageMetadata?.totalTokenCount };
  }
}

// ── OpenAI-compatible (OpenAI, OpenRouter, Mistral) ──────────
class OpenAICompatibleProvider implements AIProvider {
  name: AIProviderName;
  config: ProviderConfig;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig, apiKey: string, model?: string) {
    this.name = config.name;
    this.config = config;
    this.apiKey = apiKey;
    this.model = model || config.defaultModel;
  }

  async chat(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number }) {
    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${this.config.displayName} API error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || "Réponse vide.",
      tokensUsed: data.usage?.total_tokens,
    };
  }
}

// ── Claude (Anthropic) ───────────────────────────────────────
class ClaudeProvider implements AIProvider {
  name: AIProviderName = "claude";
  config: ProviderConfig;
  private apiKey: string;
  private model: string;

  constructor(config: ProviderConfig, apiKey: string, model?: string) {
    this.config = config;
    this.apiKey = apiKey;
    this.model = model || config.defaultModel;
  }

  async chat(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number }) {
    const systemMsgs = messages.filter(m => m.role === "system");
    const systemText = systemMsgs.map(m => m.content).join("\n");
    const apiMessages = messages.filter(m => m.role !== "system");

    const res = await fetch(`${this.config.baseUrl}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        messages: apiMessages,
        system: systemText || undefined,
        max_tokens: options.maxTokens ?? 4096,
        temperature: options.temperature ?? 0.7,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude API error ${res.status}: ${err.slice(0, 200)}`);
    }
    const data = await res.json();
    return {
      content: data.content?.map((c: { text: string }) => c.text).join("") || "Réponse vide.",
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
    };
  }
}

// ── Ollama (local, pas de clé API) ───────────────────────────
class OllamaProvider implements AIProvider {
  name: AIProviderName = "ollama";
  config: ProviderConfig;
  private host: string;
  private model: string;

  constructor(config: ProviderConfig, host: string, model?: string) {
    this.config = config;
    this.host = host || config.baseUrl;
    this.model = model || config.defaultModel;
  }

  async chat(messages: ChatMessage[], options: { temperature?: number }) {
    const res = await fetch(`${this.host}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, messages, stream: false, options: { temperature: options.temperature ?? 0.7 } }),
    });
    if (!res.ok) {
      throw new Error(`Ollama error ${res.status}. Vérifiez que Ollama tourne sur ${this.host}`);
    }
    const data = await res.json();
    return { content: data.message?.content || "Réponse vide.", tokensUsed: data.eval_count };
  }
}
