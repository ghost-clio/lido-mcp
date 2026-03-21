import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Address } from "viem";
import { LidoClient } from "../lib/lido.js";

export function registerBalanceTools(server: McpServer, lido: LidoClient) {
  server.tool(
    "lido_balance",
    "Get ETH, stETH, and wstETH balances for an address. Shows total stETH-equivalent value and current APY.",
    {
      address: z.string().describe("Ethereum address to query (0x...)"),
    },
    async ({ address }) => {
      try {
        const balances = await lido.getBalances(address as Address);
        const stats = await lido.getProtocolStats();

        const result = {
          address,
          ...balances,
          current_steth_apy: stats.steth_apy,
        };

        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching balances: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "lido_rewards",
    "Estimate stETH staking rewards for an address based on current holdings and APY.",
    {
      address: z.string().describe("Ethereum address to query (0x...)"),
      days: z.number().default(30).describe("Number of days to estimate rewards for (default: 30)"),
    },
    async ({ address, days }) => {
      try {
        const balances = await lido.getBalances(address as Address);
        const totalSteth = parseFloat(balances.total_steth_equivalent);
        const apyRate = 0.03; // ~3% APY approximation

        const dailyRate = apyRate / 365;
        const estimatedReward = totalSteth * dailyRate * days;
        const annualizedReward = totalSteth * apyRate;

        const result = {
          address,
          total_steth_equivalent: balances.total_steth_equivalent,
          estimated_apy: "~3.0%",
          period_days: days,
          estimated_reward_steth: estimatedReward.toFixed(6),
          annualized_reward_steth: annualizedReward.toFixed(6),
          note: "Rewards are approximate. stETH rebases daily via oracle reports. Actual rewards vary based on validator performance and network conditions.",
        };

        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching rewards: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "lido_stats",
    "Get Lido protocol-wide statistics: total staked ETH, APY, validators, withdrawal queue, and more.",
    {},
    async () => {
      try {
        const stats = await lido.getProtocolStats();
        return {
          content: [{ type: "text" as const, text: JSON.stringify(stats, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching stats: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
