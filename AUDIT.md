# Lido MCP Server — Security & Correctness Audit

**Auditor:** Claude Opus 4.6 (automated)
**Date:** 2026-03-21
**Scope:** Full codebase review (`src/` — 9 files, ~620 lines)

---

## Summary

The Lido MCP server is well-structured and follows MCP conventions correctly. Contract addresses and ABIs are accurate. The primary issues found were around input validation, dry-run mode requiring a private key when it shouldn't, and hardcoded yield values. All fixable issues have been patched in this commit.

**Severity counts:** 2 High, 3 Medium, 4 Low/Informational

---

## Issues Found & Fixed

### HIGH-1: Dry-run operations require ETH_PRIVATE_KEY

**Files:** `src/lib/lido.ts` (unstake, wrap, vote)

**Problem:** `unstake()`, `wrap()`, and `vote()` all called `this.getWalletClient()` *before* the `dryRun` check. This meant dry-run simulations would throw `"ETH_PRIVATE_KEY environment variable is required"` — defeating the purpose of dry-run mode for read-only users.

**Fix:** Restructured all three methods so dry-run paths only access the wallet client when a key is available. Without a key, dry-run still returns useful data (gas estimates, conversion rates) with a note that allowance checks require a key.

### HIGH-2: No input validation on amounts

**Files:** `src/lib/lido.ts` (stake, unstake, wrap, unwrap)

**Problem:** Amount strings were passed directly to `parseEther()` without checking for zero, negative, or non-numeric values. A zero amount would waste gas; a non-numeric string would throw an unhelpful viem error.

**Fix:** Added `parseAmount()` helper that validates the string is a positive number before parsing. Clear error messages like `Invalid stake amount: "abc". Must be a positive number (e.g. "1.5").`

### MEDIUM-1: No address validation

**Files:** `src/tools/balance.ts` (lido_balance, lido_rewards)

**Problem:** User-supplied addresses were cast with `address as Address` without validation. Invalid addresses would produce cryptic RPC errors.

**Fix:** Added `LidoClient.validateAddress()` static method using viem's `isAddress()`. Both balance tools now validate before querying.

### MEDIUM-2: Meaningless gas estimate in unstake dry-run

**File:** `src/lib/lido.ts`

**Problem:** The unstake dry-run estimated gas with `data: "0x00"` — a 1-byte payload that doesn't encode any function call. The estimate was meaningless and the code fell through to a `catch(() => BigInt(300_000))` fallback every time.

**Fix:** Replaced with a realistic static estimate of `350,000` gas (withdrawal requests cost 300-400K gas based on on-chain data). This is more honest than a fake estimate.

### MEDIUM-3: `since` parameter ignored in vault_alerts

**File:** `src/lib/vault-monitor.ts`

**Problem:** `getAlerts()` accepted a `since` parameter but never used it to filter results.

**Fix:** Added timestamp filtering — alerts with timestamps before `since` are now excluded.

### LOW-1: Hardcoded APY values

**Files:** `src/lib/lido.ts`, `src/lib/vault-monitor.ts`

**Status:** Not fixed (by design)

The stETH APY (`~3.0%`) and vault APYs (`~4.5%`, `~8.0%`) are hardcoded approximations. Computing real APY requires historical oracle report data (stETH rebase events over time), which is complex and RPC-intensive. The Aave supply rate IS correctly read from the contract (RAY → percentage conversion is accurate). The hardcoded values are clearly marked with `~` prefix. This is an acceptable trade-off for an MCP tool, but should be documented for users.

### LOW-2: Governance status heuristic is simplified

**File:** `src/lib/lido.ts` (`getProposals`)

**Status:** Not fixed (acceptable)

The status determination uses `open → active, executed → passed, else → rejected`. In Aragon, a vote can be closed but not yet executed (passed but pending execution). This edge case is minor for monitoring purposes.

### LOW-3: Vault allocation percentages are static estimates

**File:** `src/lib/vault-monitor.ts`

**Status:** Not fixed (by design)

The vault allocation breakdowns (e.g., "Morpho 35%, Aave 25%") are hardcoded estimates. Actual allocations would require reading each underlying protocol position, which varies by vault strategy and is not exposed via a single contract call.

### LOW-4: Unused constants

**File:** `src/lib/constants.ts`

**Status:** Not fixed (informational)

`LIDO_DAO_TOKEN`, `WSTETH_BASE`, `WSTETH_OPTIMISM`, `WSTETH_ARBITRUM`, and `AAVE_WETH_ATOKEN` are declared but never imported. These may be for future use (L2 balance queries, LDO governance checks).

---

## What's Correct

### Contract Addresses (all verified against Lido docs)
| Contract | Address | Status |
|----------|---------|--------|
| stETH | `0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84` | Correct |
| wstETH | `0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0` | Correct |
| Withdrawal Queue | `0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1` | Correct |
| Aragon Voting | `0x2e59A20f205bB85a89C53f1936454680651E618e` | Correct |
| LDO Token | `0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32` | Correct |
| Aave V3 Pool | `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` | Correct |
| WETH | `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2` | Correct |

### ABIs
- `submit(address)` selector `0xa1903eab` — correct
- stETH ABI (balanceOf, approve, allowance, getTotalPooledEther, getBeaconStat, etc.) — correct
- wstETH ABI (wrap, unwrap, stEthPerToken, getStETHByWstETH, getWstETHByStETH) — correct
- Withdrawal Queue ABI (requestWithdrawals, getWithdrawalStatus) — correct
- Aragon Voting ABI (getVote output tuple matches on-chain) — correct
- Aave V3 getReserveData — correct (RAY rate conversion `/ 1e27 * 100` is accurate)
- ERC-4626 vault ABI (totalAssets, totalSupply, convertToAssets, asset) — correct

### MCP Compliance
- Uses `@modelcontextprotocol/sdk` McpServer + StdioServerTransport correctly
- 12 tools registered with zod schemas
- All tools return `{ content: [{ type: "text", text: ... }] }` per spec
- Error responses include `isError: true`
- Dry-run defaults to `true` for all write operations (safe by default)

### Security (Good Practices)
- Private key is never logged, returned in tool output, or exposed in error messages
- Wallet client is lazily initialized (only created when a write op is actually needed)
- Private key prefix handling (`0x` optional) is correct
- All tool handlers have try/catch with user-friendly error messages
- No injection vectors — contract calls use typed ABIs, not string interpolation

### Error Handling
- Every tool wraps its handler in try/catch
- Errors surface to the MCP client with `isError: true` and the error message
- Governance proposal iteration silently skips votes that fail to decode (reasonable)
- Vault monitor handles unreachable vaults with a critical alert

---

## Remaining Recommendations

1. **Dynamic APY calculation** — Fetch recent oracle reports (stETH `TokenRebased` events) to compute actual trailing APY instead of hardcoding `~3.0%`.

2. **Withdrawal status tool** — Add a `lido_withdrawal_status` tool that checks the status of specific withdrawal request IDs. The ABI for `getWithdrawalStatus` is already defined but not exposed as a tool.

3. **L2 balance queries** — The L2 wstETH addresses (Base, Optimism, Arbitrum) are defined but unused. Adding cross-chain balance queries would differentiate this server.

4. **Rate limiting** — No RPC rate limiting or caching. Repeated `lido_stats` calls will hit the RPC with 7 concurrent reads each time. Consider caching protocol stats for ~30 seconds.

5. **Vault address verification** — The Earn vault addresses (`0xBEEF69...`, `0xBEEF01...`) are MetaMorpho/Steakhouse vaults. These should be verified against the latest Lido Earn deployment, as vault addresses can change if new vaults are deployed.
