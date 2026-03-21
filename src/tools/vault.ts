import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { VaultMonitor } from "../lib/vault-monitor.js";

export function registerVaultTools(server: McpServer, vaultMonitor: VaultMonitor) {
  server.tool(
    "vault_health",
    "Check Lido Earn vault health: total assets, current yield, protocol allocations, and benchmark comparison.",
    {
      vault: z
        .enum(["earnETH", "earnUSD"])
        .default("earnETH")
        .describe("Which vault to check (earnETH or earnUSD)"),
    },
    async ({ vault }) => {
      try {
        const health = await vaultMonitor.getVaultHealth(vault);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(health, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error checking vault health: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "vault_alerts",
    "Get alerts and status changes for a Lido Earn vault. Returns actionable insights about yield, allocations, and risks.",
    {
      vault: z
        .enum(["earnETH", "earnUSD"])
        .default("earnETH")
        .describe("Which vault to check"),
      since: z
        .number()
        .optional()
        .describe("Unix timestamp — only return alerts after this time"),
    },
    async ({ vault, since }) => {
      try {
        const alerts = await vaultMonitor.getAlerts(vault, since);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  vault,
                  alert_count: alerts.length,
                  alerts,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching vault alerts: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "vault_benchmark",
    "Compare Lido Earn vault yield against benchmarks: raw stETH APY and Aave v3 WETH supply rate.",
    {
      vault: z
        .enum(["earnETH", "earnUSD"])
        .default("earnETH")
        .describe("Which vault to benchmark"),
    },
    async ({ vault }) => {
      try {
        const benchmark = await vaultMonitor.getBenchmarkComparison(vault);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(benchmark, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error fetching benchmark: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
