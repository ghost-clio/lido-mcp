# Lido Staking — Agent Skill

You have access to a Lido MCP server that lets you stake ETH, manage stETH/wstETH, query governance, and monitor Lido Earn vaults. Use this knowledge to help users interact with Lido safely and effectively.

## Core Concepts

### What is Lido?
Lido is the largest liquid staking protocol on Ethereum. Users deposit ETH and receive **stETH**, a liquid staking token that earns ~3% APY from Ethereum validator rewards. stETH can be used across DeFi while the underlying ETH earns staking yield.

### stETH — Rebasing Liquid Staking Token
- **stETH rebases daily.** Your stETH balance increases automatically when the Lido oracle reports validator rewards (typically once per day).
- 1 stETH ≈ 1 ETH in value. The peg is maintained by the underlying staked ETH.
- stETH can be traded, used as collateral, or provided as liquidity.

### wstETH — Wrapped, Non-Rebasing stETH
- **wstETH does NOT rebase.** Instead, 1 wstETH represents an increasing amount of stETH over time.
- The wstETH/stETH exchange rate only goes up — it reflects accumulated rewards.
- **Use wstETH when:**
  - Bridging to L2s (Base, Optimism, Arbitrum) — only wstETH is available on L2s
  - Using in DeFi protocols that don't support rebasing tokens
  - You want a "set and forget" token without balance changes
- **Use stETH when:**
  - You want to see your rewards reflected in your balance
  - Using in DeFi protocols that support rebasing (Aave, Curve)
  - You plan to stay on Ethereum mainnet

### Conversion
- Wrapping: stETH → wstETH (you get fewer wstETH than stETH you put in, because 1 wstETH > 1 stETH)
- Unwrapping: wstETH → stETH (you get more stETH than wstETH you put in, because rewards accrued)

## Safe Staking Patterns

### Before Staking
1. Confirm the amount the user wants to stake
2. Always use `dry_run: true` first to simulate and show gas estimates
3. Only execute with `dry_run: false` after explicit user confirmation

### Before Unstaking
1. Check the withdrawal queue with `lido_stats` — long queues mean longer waits
2. Inform users: withdrawals take **1-5 days** to finalize
3. For urgent liquidity, suggest selling stETH on a DEX instead (faster but may have slippage)

### Before Wrapping/Unwrapping
1. Show the current exchange rate so users understand the conversion
2. Explain why the amounts differ (wstETH accumulates value, so 1 wstETH > 1 stETH)

## Yield Mechanics

- Ethereum validators earn rewards for proposing and attesting to blocks
- Lido pools thousands of validators, distributing rewards to all stETH holders
- Oracle reports happen ~daily, updating the stETH exchange rate
- Lido takes a 10% fee on rewards (5% to node operators, 5% to DAO treasury)
- Net APY to stakers is typically ~3% (varies with network conditions)

## Governance

- Lido is governed by the **Lido DAO** using **LDO** tokens
- Governance uses an **Aragon voting** contract
- To vote, users need LDO tokens (not stETH)
- Proposals cover protocol upgrades, fee changes, node operator management
- Always check if a vote is still `open` before attempting to vote

## Common Pitfalls

1. **Rebasing + Allowances:** If you approve a specific stETH amount, a rebase can make the balance exceed the approval. Use `type(uint256).max` for approvals or re-approve after rebasing.
2. **L2 Bridging:** Only wstETH can be bridged to L2s. Wrap stETH → wstETH before bridging.
3. **Gas Costs:** Staking is cheap (~80K gas). Unstaking is expensive (~300K+ gas) due to withdrawal queue NFT minting.
4. **Withdrawal Timing:** Withdrawals are NOT instant. The 1-5 day timeline depends on the withdrawal queue length and validator exit processing.
5. **Share Accounting:** Internally, Lido tracks shares, not stETH balances. Two transactions of the same stETH amount may result in different share amounts depending on when the oracle last reported.

## Available Tools

| Tool | Purpose |
|------|---------|
| `lido_stake` | Stake ETH → stETH |
| `lido_unstake` | Request withdrawal stETH → ETH |
| `lido_wrap` | Wrap stETH → wstETH |
| `lido_unwrap` | Unwrap wstETH → stETH |
| `lido_balance` | Get ETH/stETH/wstETH balances |
| `lido_rewards` | Estimate staking rewards |
| `lido_stats` | Protocol-wide statistics |
| `lido_proposals` | List governance proposals |
| `lido_vote` | Vote on a proposal |
| `vault_health` | Check Earn vault status |
| `vault_alerts` | Get vault alerts/changes |
| `vault_benchmark` | Compare vault vs benchmarks |

## Lido Earn Vaults

Lido Earn vaults (by Steakhouse/MEV Capital) deploy wstETH or stablecoins across DeFi protocols (Morpho, Aave, Pendle, Gearbox, Maple) to generate yield above base stETH staking. Use `vault_health`, `vault_alerts`, and `vault_benchmark` to monitor positions.

## Workflow Examples

### "I want to stake 10 ETH"
1. `lido_stake(amount: "10", dry_run: true)` — simulate first
2. Show the user the gas estimate and expected stETH
3. On confirmation: `lido_stake(amount: "10", dry_run: false)`

### "What are my Lido holdings?"
1. `lido_balance(address: "0x...")` — shows all balances
2. `lido_rewards(address: "0x...", days: 30)` — estimated rewards

### "How is the Earn vault doing?"
1. `vault_health(vault: "earnETH")` — allocations and yield
2. `vault_benchmark(vault: "earnETH")` — vs stETH and Aave
3. `vault_alerts(vault: "earnETH")` — any issues?
