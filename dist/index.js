#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { LidoClient } from "./lib/lido.js";
import { VaultMonitor } from "./lib/vault-monitor.js";
import { registerStakingTools } from "./tools/staking.js";
import { registerBalanceTools } from "./tools/balance.js";
import { registerGovernanceTools } from "./tools/governance.js";
import { registerVaultTools } from "./tools/vault.js";
const server = new McpServer({
    name: "lido-mcp",
    version: "1.0.0",
});
const rpcUrl = process.env.ETH_RPC_URL;
const lido = new LidoClient(rpcUrl);
const vaultMonitor = new VaultMonitor(rpcUrl);
// Register all tool groups
registerStakingTools(server, lido);
registerBalanceTools(server, lido);
registerGovernanceTools(server, lido);
registerVaultTools(server, vaultMonitor);
// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Lido MCP server running on stdio");
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map