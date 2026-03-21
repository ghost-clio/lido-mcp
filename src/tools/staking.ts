import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LidoClient } from "../lib/lido.js";

export function registerStakingTools(server: McpServer, lido: LidoClient) {
  server.tool(
    "lido_stake",
    "Stake ETH to receive stETH via Lido. Returns ~1:1 stETH. stETH rebases daily to reflect staking rewards.",
    {
      amount: z.string().describe("Amount of ETH to stake (e.g. '1.5')"),
      dry_run: z.boolean().default(true).describe("If true, simulate the transaction without executing"),
    },
    async ({ amount, dry_run }) => {
      try {
        const result = await lido.stake(amount, dry_run);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error staking: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "lido_unstake",
    "Request withdrawal from stETH back to ETH. Creates a withdrawal request NFT. Withdrawals take 1-5 days to finalize.",
    {
      amount: z.string().describe("Amount of stETH to withdraw (e.g. '1.0')"),
      dry_run: z.boolean().default(true).describe("If true, simulate the transaction without executing"),
    },
    async ({ amount, dry_run }) => {
      try {
        const result = await lido.unstake(amount, dry_run);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error unstaking: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "lido_wrap",
    "Wrap stETH into wstETH. wstETH is non-rebasing — its balance stays constant while its value accrues. Required for DeFi and L2 bridging.",
    {
      amount: z.string().describe("Amount of stETH to wrap (e.g. '10.0')"),
      dry_run: z.boolean().default(true).describe("If true, simulate the transaction without executing"),
    },
    async ({ amount, dry_run }) => {
      try {
        const result = await lido.wrap(amount, dry_run);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error wrapping: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "lido_unwrap",
    "Unwrap wstETH back to stETH. You'll receive more stETH than you originally wrapped due to accrued rewards.",
    {
      amount: z.string().describe("Amount of wstETH to unwrap (e.g. '5.0')"),
      dry_run: z.boolean().default(true).describe("If true, simulate the transaction without executing"),
    },
    async ({ amount, dry_run }) => {
      try {
        const result = await lido.unwrap(amount, dry_run);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error unwrapping: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
