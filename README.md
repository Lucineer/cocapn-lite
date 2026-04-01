# cocapn-lite — Tabula Rasa Seed

> *Zero dependencies. Pure Node.js. ~200 lines. Fork and grow.*

The minimal cocapn seed for power users. No features you don't need. No bloat. Just a repo-native AI that remembers every conversation and grows smarter over time.

## What It Is

- A Cloudflare Worker (~200 lines of TypeScript)
- SSE streaming chat with DeepSeek
- KV-backed persistent memory
- Session management
- Zero runtime dependencies

## What It's Not

- Not a full platform
- Not a feature showcase
- Not a template with demo data
- Not opinionated about your domain

It's a seed. Plant it where you want.

## Quick Start

```bash
git clone https://github.com/Lucineer/cocapn-lite.git
cd cocapn-lite
npm install

# Create KV namespace
npx wrangler kv namespace create MEMORY
# Update wrangler.toml with the namespace ID

# Set your API key
npx wrangler secret put DEEPSEEK_API_KEY

# Run locally
npx wrangler dev

# Deploy
npx wrangler deploy
```

## The Philosophy

Cocapn-lite is to cocapn what miniclaw is to OpenClaw. The absolute minimum. A blank canvas. A spruce cone.

Every feature beyond "remember and respond" is a choice YOU make. Add what you need. Remove what you don't. The repo grows with you.

## Compare to cocapn (flagship)

| | cocapn-lite | cocapn |
|---|---|---|
| Lines | ~200 | ~12,000+ |
| Dependencies | 0 | 0 runtime |
| Features | Chat + memory | Full platform |
| For | Power users | Everyone |
| Philosophy | Tabula rasa | World-class starter |

## The Two-Repo Model

1. **cocapn** (flagship) — polished, feature-rich, ready to fork and customize
2. **cocapn-lite** (this) — minimal seed, for builders who want to grow from scratch

Both are open source. Both are MIT licensed. Both are yours.

Author: Superinstance
