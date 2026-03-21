# Lido MCP Server

An MCP (Model Context Protocol) server that makes Lido staking operations natively callable by any AI agent. Supports staking, unstaking, wrapping, governance, and Lido Earn vault monitoring — all against real Ethereum mainnet contracts.

## Features

- **Staking**: Stake ETH → stETH, request withdrawals, wrap/unwrap stETH ↔ wstETH
- **Balances & Rewards**: Query holdings, estimate staking rewards, protocol stats
- **Governance**: List Lido DAO proposals, cast votes via Aragon
- **Vault Monitoring**: Track Lido Earn vault health, yield benchmarks, alerts
- **Dry Run Mode**: Every write operation supports simulation before execution
- **No Mocks**: All data comes from live Ethereum mainnet contracts

## Quick Start

### Install and Build

```bash
git clone https://github.com/your-org/lido-mcp.git
cd lido-mcp
npm install
npm run build
```

### Connect to Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "lido": {
      "command": "node",
      "args": ["/path/to/lido-mcp/dist/index.js"],
      "env": {
        "ETH_RPC_URL": "https://eth.llamarpc.com",
        "ETH_PRIVATE_KEY": "0x..."
      }
    }
  }
}
```

### Connect to Cursor

In Cursor settings → MCP Servers, add:

```json
{
  "lido": {
    "command": "node",
    "args": ["/path/to/lido-mcp/dist/index.js"]
  }
}
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ETH_RPC_URL` | No | Ethereum RPC endpoint (default: `https://eth.llamarpc.com`) |
| `ETH_PRIVATE_KEY` | For writes | Hex-encoded private key for staking/voting transactions |

Read-only operations (balances, stats, proposals) work without a private key.

## Available Tools

### Staking

| Tool | Description | Params |
|------|-------------|--------|
| `lido_stake` | Stake ETH → stETH | `amount`, `dry_run` |
| `lido_unstake` | Request withdrawal stETH → ETH | `amount`, `dry_run` |
| `lido_wrap` | Wrap stETH → wstETH | `amount`, `dry_run` |
| `lido_unwrap` | Unwrap wstETH → stETH | `amount`, `dry_run` |

### Queries

| Tool | Description | Params |
|------|-------------|--------|
| `lido_balance` | ETH/stETH/wstETH balances | `address` |
| `lido_rewards` | Estimated staking rewards | `address`, `days` |
| `lido_stats` | Protocol-wide statistics | — |

### Governance

| Tool | Description | Params |
|------|-------------|--------|
| `lido_proposals` | List DAO proposals | `status`, `limit` |
| `lido_vote` | Vote on a proposal | `proposal_id`, `support`, `dry_run` |

### Vault Monitor

| Tool | Description | Params |
|------|-------------|--------|
| `vault_health` | Vault status and allocations | `vault` |
| `vault_alerts` | Vault alerts and changes | `vault`, `since` |
| `vault_benchmark` | Yield vs stETH/Aave benchmarks | `vault` |

## Architecture

```
lido-mcp/
├── src/
│   ├── index.ts              # MCP server entry point (stdio transport)
│   ├── tools/
│   │   ├── staking.ts        # lido_stake, lido_unstake, lido_wrap, lido_unwrap
│   │   ├── balance.ts        # lido_balance, lido_rewards, lido_stats
│   │   ├── governance.ts     # lido_proposals, lido_vote
│   │   └── vault.ts          # vault_health, vault_alerts, vault_benchmark
│   ├── lib/
│   │   ├── lido.ts           # Lido contract interactions via viem
│   │   ├── vault-monitor.ts  # Earn vault monitoring + benchmarking
│   │   └── constants.ts      # Contract addresses, ABIs
│   └── types.ts              # TypeScript interfaces
├── lido.skill.md             # Agent skill file (teaches Lido mental model)
├── package.json
├── tsconfig.json
└── README.md
```

### How It Works

1. The MCP server starts on **stdio** and registers 12 tools
2. **Read operations** use a public RPC (no API key needed) via `viem`'s `publicClient`
3. **Write operations** require `ETH_PRIVATE_KEY` and use `viem`'s `walletClient`
4. **Dry runs** simulate transactions via `eth_call` / `estimateGas` — no state changes
5. All amounts are in human-readable format (ETH, not wei) — conversion is handled internally

### Contract Addresses (Ethereum Mainnet)

| Contract | Address |
|----------|---------|
| stETH | `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84` |
| wstETH | `0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0` |
| Withdrawal Queue | `0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1` |
| Aragon Voting | `0x2e59A20f205bB85a89C53f1936454680651E618e` |

## Examples

### Check balances
```
> Use lido_balance for address 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
```

### Simulate staking
```
> Stake 1 ETH with Lido (dry run first)
```

### Monitor vault
```
> How is the Earn ETH vault doing? Compare it to stETH and Aave.
```

### Check governance
```
> Show me the latest Lido DAO proposals
```

## Agent Skill File

The `lido.skill.md` file teaches AI agents the Lido mental model — rebasing mechanics, stETH vs wstETH tradeoffs, safe staking patterns, common pitfalls, and workflow examples. Point your agent to this file for best results.

## Links

- [Lido Documentation](https://docs.lido.fi)
- [Lido Deployed Contracts](https://docs.lido.fi/deployed-contracts)
- [MCP Specification](https://modelcontextprotocol.io)
- [Lido DAO Governance](https://vote.lido.fi)

## License

MIT
