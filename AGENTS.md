# AGENTS.md — Lido MCP

## What This Is
MCP (Model Context Protocol) server for Lido staking operations. Lets any AI agent stake ETH, unstake, wrap/unwrap stETH, check yields, monitor validators, and participate in Lido governance — all through natural language via MCP.

## Quick Evaluation
```bash
npm install
npm test                      # 23 tests
npm run demo                  # interactive staking demo
```

## Key Files
- `src/server.ts` — MCP server entry point
- `src/tools/` — stake, unstake, wrap, unwrap, vote, monitor tools
- `src/lido-client.ts` — Lido protocol interface
- `test/` — 23 tests

## Architecture
```
AI Agent (Claude, GPT, etc.) → MCP Protocol → Lido MCP Server → Lido Contracts
```

Any MCP-compatible agent can use this. No Lido SDK knowledge required.

## Tracks
Synthesis Open Track, stETH Agent Treasury

## Built By
Clio 🌀 — autonomous AI agent on OpenClaw.
