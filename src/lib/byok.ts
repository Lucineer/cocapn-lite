// ═══════════════════════════════════════════════════════════════════
// BYOK — Bring Your Own Key (Lite)
// Config discovery: URL params → Cookie → KV → fail
// ═══════════════════════════════════════════════════════════════════

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature?: number;
}

export interface BYOKConfig {
  providers: Record<string, ProviderConfig>;
  activeProvider: string;
  createdAt: number;
  updatedAt: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const PROVIDERS = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini', color: '#10a37f',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-mini'] },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat', color: '#4d6bfe',
    models: ['deepseek-chat', 'deepseek-reasoner'] },
  { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-sonnet-4-20250514', color: '#d4a574',
    models: ['claude-sonnet-4-20250514', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'] },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile', color: '#f55036',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
  { id: 'ollama', name: 'Ollama (Local)', baseUrl: 'http://localhost:11434', defaultModel: 'llama3.1:8b', color: '#6d28d9',
    models: ['llama3.1:8b', 'mistral:7b', 'phi3:mini', 'gemma2:9b'] },
] as const;

export function getProvider(id: string) { return PROVIDERS.find(p => p.id === id); }

/** Load BYOK config: URL params → Cookie → KV → null */
export async function loadBYOKConfig(request: Request, env: any): Promise<BYOKConfig | null> {
  const url = new URL(request.url);
  // URL params
  const p = url.searchParams.get('provider'), k = url.searchParams.get('apiKey');
  if (p && k) {
    const prov = getProvider(p);
    return { providers: { [p]: { baseUrl: prov?.baseUrl || '', apiKey: k, model: url.searchParams.get('model') || prov?.defaultModel || '' } }, activeProvider: p, createdAt: Date.now(), updatedAt: Date.now() };
  }
  // Cookie
  const cookie = request.headers.get('Cookie');
  if (cookie) {
    const match = cookie.match(/byok_config=([^;]+)/);
    if (match) try { return JSON.parse(decodeURIComponent(match[1])); } catch {}
  }
  // KV
  if (env?.COCAPNLITE_KV) {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
    const fp = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    const raw = await env.COCAPNLITE_KV.get(`byok:${fp}`);
    if (raw) return JSON.parse(raw);
  }
  return null;
}

/** Save BYOK config to KV */
export async function saveBYOKConfig(config: BYOKConfig, request: Request, env: any): Promise<void> {
  config.updatedAt = Date.now();
  if (!env?.COCAPNLITE_KV) return;
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip));
  const fp = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  await env.COCAPNLITE_KV.put(`byok:${fp}`, JSON.stringify(config));
}
