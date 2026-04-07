# ⚓ Cocapn Lite

A minimal, auditable implementation of the Fleet protocol for building agents. It's a single, understandable file you can own and modify.

This is the reference seed for the Cocapn Fleet—a blank starting point written for readability. No magic, just working code.

## Why it exists

Many agent runtimes are complex with opaque internals. Cocapn Lite is built as a baseline: the smallest correct implementation of the Fleet protocol, designed to be read and understood completely.

## What it is

- **~200 lines** of TypeScript in one file.
- **Zero dependencies.** No packages, no supply chain risk.
- **Fork-first.** This isn't a library; it's a template you own after cloning.
- **Open protocol.** It speaks the Fleet protocol and works with the network.

## Live Reference Node

Test the deployed seed node:  
👉 [https://the-fleet.casey-digennaro.workers.dev](https://the-fleet.casey-digennaro.workers.dev)

## What it does

*   **Direct provider routing** – Use your own API keys for DeepSeek, OpenAI-compatible, and other providers. No traffic is proxied through us.
*   **Conversation memory** – KV-backed session storage with automatic pruning.
*   **SSE streaming** – Real-time responses for chat.
*   **Provider failover** – If a primary provider fails, it attempts the next one in your list.
*   **Fleet protocol support** – Joins and participates in the Cocapn Fleet network.

**One honest limitation:** It's built for Cloudflare Workers. If you need to run elsewhere, you'll need to adapt the KV and runtime logic.

## Quick Start

1.  **Fork or clone** this repository.
2.  **Deploy** to Cloudflare Workers:
    ```bash
    npx wrangler deploy
    ```
3.  **Configure** your API keys as secrets (`npx wrangler secret put DEEPSEEK_API_KEY`) and customize the agent in `src/index.ts`.

## Configuration

Set provider API keys as Cloudflare secrets. You can configure multiple providers. A simple setup interface is available at `/setup` after deployment.

---

MIT License · Superinstance & Lucineer (DiGennaro et al.)

<div align="center">
  <a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> ·
  <a href="https://cocapn.ai">Cocapn</a>
</div>