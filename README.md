# ⚓ Cocapn Lite

You build agents. You want to own the code that handles your API keys and routes your requests. This is a single, auditable Cloudflare Worker that connects directly to LLM providers—no intermediary proxy, no third-party gateway. It’s a starting point you can fork, modify, and deploy under your own account.

---

## Why This Exists
Many frameworks require you to run their servers, import large dependency trees, or route traffic through their systems. This is a minimal alternative: you control every line of code that touches your API keys and request logic.

---

## Quick Start
You can deploy a private agent in a few minutes.

1.  **Fork this repository.** This is the only required step to own the code.
2.  Deploy directly to Cloudflare Workers:
    ```bash
    npx wrangler deploy
    ```
3.  Set your API keys as environment secrets (do not commit them):
    ```bash
    npx wrangler secret put DEEPSEEK_API_KEY
    ```

A public seed is available at [the-fleet.casey-digennaro.workers.dev](https://the-fleet.casey-digennaro.workers.dev).

---

## What This Is
1.  **A fork‑first codebase.** You will never install an `npm` package. You fork, modify the ~200 lines, and deploy it as your own.
2.  **No telemetry.** No code sends data anywhere except to the LLM provider endpoints you configure.
3.  **Zero dependencies.** It uses the Cloudflare Workers runtime and native APIs. There are no external packages that can break or introduce supply‑chain risks.

---

## What It Does
*   **Direct API routing:** Your API keys are used only in requests sent straight to the LLM provider you choose.
*   **Conversation memory:** Uses Cloudflare KV for session storage. Idle sessions are removed after 1 hour.
*   **SSE streaming:** Real‑time token streaming compatible with standard chat interfaces.
*   **Fleet Protocol support:** Can speak the open Fleet Protocol to join a decentralized network, or be kept entirely private.

---

## One Specific Limitation
The included KV‑based session memory is designed for low‑to‑moderate request volumes and automatically discards data after 1 hour of inactivity. If you need longer retention or higher throughput, you will need to modify or replace the storage logic.

---

## Architecture
This is a plain Cloudflare Worker. It stores conversation context in KV, validates incoming requests, and makes `fetch` calls to LLM provider APIs. The entire implementation is contained in one file.

---

MIT License

Originally built by Superinstance and Lucineer (DiGennaro et al.).

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>