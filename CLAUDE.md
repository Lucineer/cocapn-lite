# CLAUDE.md — Cocapn Lite

## What This Is
cocapn-lite is the tabula rasa seed for Cocapn vessels. Minimal Cloudflare Worker (~200 lines), zero runtime deps, BYOK (bring your own key) chat.

## Architecture
- `src/worker.ts` — single Worker with routes: /, /health, /setup, /app, /api/chat, /api/config, /api/memory, /api/sessions
- `src/lib/byok.ts` — BYOK module: provider registry, config load/save, multi-provider LLM routing
- `wrangler.toml` — KV binding: COCAPNLITE_KV

## Key Patterns
- BYOK config discovery: URL params → Cookie → KV → fail (redirect to /setup)
- All LLM calls go through OpenAI-compatible format (Anthropic messages endpoint is compatible)
- SSE streaming for chat
- KV-backed conversation memory (per session, max 500 messages)

## Customization Points
1. **Brand**: Change `ACCENT` color constant in worker.ts and CSS variables
2. **System prompt**: Edit `SYSTEM_PROMPT` in worker.ts
3. **Add providers**: Add to PROVIDERS array in byok.ts
4. **Add routes**: Add route handlers in the fetch switch
5. **Custom domain**: Set in Cloudflare dashboard

## Deploy
```bash
npm install
npx wrangler kv:namespace create COCAPNLITE_KV  # paste id into wrangler.toml
npx wrangler deploy
```

## Rules
- Keep zero runtime dependencies
- Keep worker.ts under 250 lines
- Never hardcode API keys
- All HTML inline in worker.ts (no build step)
