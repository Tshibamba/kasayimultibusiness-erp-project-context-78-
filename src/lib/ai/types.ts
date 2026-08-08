// ─────────────────────────────────────────────────────────────
// AI Infrastructure — Types partagés
// ─────────────────────────────────────────────────────────────

export type AIProviderName = "gemini" | "openai" | "claude" | "openrouter" | "mistral" | "ollama";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  conversationId?: number;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  provider: AIProviderName;
  tokensUsed?: number;
  latencyMs: number;
  conversationId: number;
}

export interface ProviderConfig {
  name: AIProviderName;
  displayName: string;
  apiKeyEnv: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  enabled: boolean;
}

export const PROVIDERS: Record<AIProviderName, ProviderConfig> = {
  gemini: {
    name: "gemini",
    displayName: "Google Gemini",
    apiKeyEnv: "GEMINI_API_KEY",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultModel: "gemini-2.0-flash",
    models: ["gemini-2.0-flash", "gemini-2.0-flash-exp", "gemini-1.5-pro", "gemini-1.5-flash"],
    enabled: true,
  },
  openai: {
    name: "openai",
    displayName: "OpenAI GPT",
    apiKeyEnv: "OPENAI_API_KEY",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    enabled: true,
  },
  claude: {
    name: "claude",
    displayName: "Anthropic Claude",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    baseUrl: "https://api.anthropic.com/v1",
    defaultModel: "claude-3-5-sonnet-20241022",
    models: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    enabled: true,
  },
  openrouter: {
    name: "openrouter",
    displayName: "OpenRouter",
    apiKeyEnv: "OPENROUTER_API_KEY",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "google/gemini-2.0-flash-exp:free",
    models: ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-3.3-70b-instruct", "deepseek/deepseek-r1"],
    enabled: true,
  },
  mistral: {
    name: "mistral",
    displayName: "Mistral AI",
    apiKeyEnv: "MISTRAL_API_KEY",
    baseUrl: "https://api.mistral.ai/v1",
    defaultModel: "mistral-small-latest",
    models: ["mistral-large-latest", "mistral-small-latest", "open-mistral-nemo"],
    enabled: true,
  },
  ollama: {
    name: "ollama",
    displayName: "Ollama (local)",
    apiKeyEnv: "OLLAMA_HOST",
    baseUrl: "http://localhost:11434",
    defaultModel: "llama3.2",
    models: ["llama3.2", "qwen2.5", "mistral", "phi3"],
    enabled: true,
  },
};
