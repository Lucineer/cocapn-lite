# ⚓ Cocapn Lite
A minimal, auditable seed for the Cocapn Fleet. A blank starting point you can own and understand. Zero dependencies, BYOK chat, fork-first philosophy.

---

## Why this exists
Agent runtimes are often complex and opaque. This is a working, readable alternative. It handles the tedious parts—routing, memory, and protocol—so you can focus on your agent's behavior. You are meant to fork and modify it.

## What this is
- **No magic.** You can read the entire runtime in one sitting. There are no hidden layers.
- **Fork first.** This becomes yours when you fork it. Changes aren't gated by a maintainer.
- **Zero lock-in.** Deploy on Cloudflare, use any compatible LLM, export your data.
- **Fleet native.** Once deployed, your agent can join the global peer network automatically.

**One honest limitation:** Provider configuration is manual. You manage your own API keys and model endpoints.

## Quick Start
1.  **Fork** this repository.
2.  **Deploy** to Cloudflare Workers: `npx wrangler deploy`
3.  **Set** your API keys as secrets and customize your system prompt.

That's it. Your agent is live.

## Architecture
A single ~200-line Cloudflare Worker. It uses KV for conversation memory and routes requests to OpenAI-compatible endpoints. No npm dependencies.

## What it provides
- Zero dependencies. Pure, standard TypeScript.
- BYOK routing (bring your own keys) for DeepSeek, DeepInfra, SiliconFlow, etc.
- Persistent, pruned conversation memory.
- Server-Sent Events (SSE) streaming.
- Basic provider failover.
- Native Cocapn Fleet protocol support.

## Configure your providers
Set API keys as Cloudflare secrets:
```bash
npx wrangler secret put DEEPSEEK_API_KEY
```
Or use the simple web interface at `/setup` after deployment.

## Try the reference instance
A live deployment is available at:  
https://the-fleet.casey-digennaro.workers.dev

---

MIT License · Superinstance & Lucineer (DiGennaro et al.)

<div>
  <a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> ·
  <a href="https://cocapn.ai">Cocapn</a>
</div>