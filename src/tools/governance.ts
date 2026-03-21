import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LidoClient } from "../lib/lido.js";

export function registerGovernanceTools(server: McpServer, lido: LidoClient) {
  server.tool(
    "lido_proposals",
    "List Lido DAO governance proposals from the Aragon voting contract. Filter by status (active/passed/rejected).",
    {
      status: z
        .enum(["active", "passed", "rejected"])
        .optional()
        .describe("Filter by proposal status"),
      limit: z.number().default(5).describe("Number of proposals to return (default: 5)"),
    },
    async ({ status, limit }) => {
      try {
        const proposals = await lido.getProposals(limit, status);

        if (proposals.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No ${status ?? ""} proposals found.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  total_returned: proposals.length,
                  filter: status ?? "all",
                  proposals,
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
              text: `Error fetching proposals: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "lido_vote",
    "Cast a vote on a Lido DAO governance proposal. Requires LDO tokens. Use dry_run to check eligibility first.",
    {
      proposal_id: z.number().describe("The proposal/vote ID to vote on"),
      support: z.boolean().describe("true = vote YES, false = vote NO"),
      dry_run: z.boolean().default(true).describe("If true, check eligibility without casting the vote"),
    },
    async ({ proposal_id, support, dry_run }) => {
      try {
        const result = await lido.vote(proposal_id, support, dry_run);
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (err) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error voting: ${err instanceof Error ? err.message : String(err)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
