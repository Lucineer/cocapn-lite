# ⚓ cocapn-lite

> The tabula rasa seed for Cocapn vessels. Fork, customize, deploy.

A minimal Cloudflare Worker (~200 lines, zero runtime deps) that provides a BYOK (bring your own key) AI chat interface with KV-backed memory.

## Quick Start

```bash
# 1. Fork this repo
# 2. Install & create KV namespace
npm install
npx wrangler kv:namespace create COCAPNLITE_KV
# 3. Paste the resulting ID into wrangler.toml
# 4. Deploy
npx wrangler deploy
# 5. Visit /setup to configure your API key
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/health` | Health check (JSON) |
| `/setup` | BYOK setup wizard |
| `/app` | Chat interface |
| `/api/chat` | SSE streaming chat (POST) |
| `/api/config` | BYOK config (GET/POST) |
| `/api/memory` | Session memory (GET) |
| `/api/sessions` | List sessions (GET) |

## Supported Providers

OpenAI · DeepSeek · Anthropic · Groq · Ollama (local)

Add more in `src/lib/byok.ts`.

## Customization

- **Brand color**: Change `ACCENT` in `src/worker.ts`
- **System prompt**: Edit `SYSTEM_PROMPT` in `src/worker.ts`
- **Add providers**: Add to `PROVIDERS` in `src/lib/byok.ts`
- **Add routes**: Add handlers in the fetch method
- **Custom domain**: Configure in Cloudflare dashboard

## Philosophy

This is the spruce cone. Fork it. Grow it. Make it yours.

The vessel paradigm: your AI agent lives in your repo, remembers every conversation, and grows smarter over time. No rented intelligence. No walled gardens. Just you, your code, and your cocapn.

## License


MIT — Built with ❤️ by [Superinstance](https://github.com/superinstance) & [Lucineer](https://github.com/Lucineer) (DiGennaro et al.)
