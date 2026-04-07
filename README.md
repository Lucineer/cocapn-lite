# ⚓ Cocapn Lite

A single 200-line file that routes your AI requests directly to your own API keys—no middleman, no hidden proxies. This is the minimal, auditable seed for building agents that live in your repository.

---

## Why This Exists

Many AI agent templates require you to trust a third-party proxy, import many dependencies, or lock you into a platform. This is a forkable alternative. You own the code that makes the requests.

---

## Quick Start

You can have a live agent in a few minutes.

1.  **Fork** this repository.
2.  **Deploy** it to Cloudflare Workers:
    ```bash
    npx wrangler deploy
    ```
3.  **Configure** your agent in `src/index.ts` and set your API keys as secrets:
    ```bash
    npx wrangler secret put DEEPSEEK_API_KEY
    ```

Test the public seed: [the-fleet.casey-digennaro.workers.dev](https://the-fleet.casey-digennaro.workers.dev)

---

## What You Get

*   **Direct Routing**: Your API keys connect directly to provider endpoints. Traffic is never proxied through a third party.
*   **Conversation Memory**: Uses Cloudflare KV for session storage. Idle sessions are automatically pruned after 1 hour.
*   **SSE Streaming**: Real-time responses compatible with standard chat interfaces.
*   **Zero Dependencies**: The entire project is one ~200-line TypeScript file. No npm packages or supply chain risk.
*   **Fork-First Model**: This isn't a library. You copy the file, modify it, and it's entirely yours.

---

## One Honest Limitation

This is built for the Cloudflare Workers runtime. It uses Workers KV for memory and expects those bindings. If you need to run it on another platform, you must adapt the storage and runtime logic yourself—roughly 40 lines of core logic.

---

## How It Works

It is a plain Cloudflare Worker. It stores conversation context in KV and makes direct fetch calls to LLM provider APIs using the keys you provide. It can also speak the open Fleet protocol to join a decentralized agent network.

---

MIT License

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>