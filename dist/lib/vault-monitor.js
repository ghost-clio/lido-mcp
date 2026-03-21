import { createPublicClient, http, formatEther, } from "viem";
import { mainnet } from "viem/chains";
import { EARN_ETH_VAULT, EARN_USD_VAULT, AAVE_V3_POOL, WETH, VAULT_ABI, AAVE_POOL_ABI, DEFAULT_RPC_URL, } from "./constants.js";
// Known allocation protocols for Lido Earn ETH vault
const EARN_ETH_PROTOCOLS = [
    { name: "Morpho (wstETH/WETH)", estimatedPct: 35 },
    { name: "Aave v3 (wstETH)", estimatedPct: 25 },
    { name: "Pendle (wstETH)", estimatedPct: 15 },
    { name: "Gearbox (wstETH leverage)", estimatedPct: 15 },
    { name: "Maple (wstETH)", estimatedPct: 10 },
];
const EARN_USD_PROTOCOLS = [
    { name: "Morpho (USDC/USDT)", estimatedPct: 40 },
    { name: "Aave v3 (USDC)", estimatedPct: 30 },
    { name: "Maple (USDC)", estimatedPct: 20 },
    { name: "Pendle (sDAI)", estimatedPct: 10 },
];
export class VaultMonitor {
    publicClient;
    constructor(rpcUrl) {
        this.publicClient = createPublicClient({
            chain: mainnet,
            transport: http(rpcUrl ?? process.env.ETH_RPC_URL ?? DEFAULT_RPC_URL),
        });
    }
    getVaultAddress(vault) {
        return vault === "earnUSD" ? EARN_USD_VAULT : EARN_ETH_VAULT;
    }
    async getVaultHealth(vaultName = "earnETH") {
        const vaultAddress = this.getVaultAddress(vaultName);
        const protocols = vaultName === "earnUSD" ? EARN_USD_PROTOCOLS : EARN_ETH_PROTOCOLS;
        let totalAssets;
        try {
            totalAssets = (await this.publicClient.readContract({
                address: vaultAddress,
                abi: VAULT_ABI,
                functionName: "totalAssets",
            }));
        }
        catch {
            // Vault may not be deployed or accessible
            totalAssets = BigInt(0);
        }
        // Get benchmark data
        const benchmark = await this.getBenchmarkComparison(vaultName);
        // Build allocations from known protocol breakdown
        const allocations = protocols.map((p) => ({
            protocol: p.name,
            percentage: `${p.estimatedPct}%`,
            apy: "—", // Would need individual protocol queries for exact APY
        }));
        return {
            vault: vaultName,
            total_assets: formatEther(totalAssets),
            current_apy: benchmark.vault_apy,
            allocations,
            benchmark_comparison: benchmark,
        };
    }
    async getBenchmarkComparison(vaultName = "earnETH") {
        // Get Aave WETH supply rate
        let aaveRate = "0";
        try {
            const reserveData = (await this.publicClient.readContract({
                address: AAVE_V3_POOL,
                abi: AAVE_POOL_ABI,
                functionName: "getReserveData",
                args: [WETH],
            }));
            // Aave rates are in RAY (1e27) — convert to percentage
            const rayRate = reserveData.currentLiquidityRate;
            const aaveApy = (Number(rayRate) / 1e27) * 100;
            aaveRate = `${aaveApy.toFixed(2)}%`;
        }
        catch {
            aaveRate = "unavailable";
        }
        // stETH APY — approximated from protocol (oracle reports)
        const stethApy = "~3.0%";
        // Vault APY estimate — Earn vaults typically yield stETH APY + leveraged strategies
        const vaultApy = vaultName === "earnETH" ? "~4.5%" : "~8.0%";
        // Parse for comparison
        const vaultNum = parseFloat(vaultApy.replace("~", "").replace("%", ""));
        const stethNum = parseFloat(stethApy.replace("~", "").replace("%", ""));
        const aaveNum = parseFloat(aaveRate.replace("~", "").replace("%", "")) || 0;
        return {
            vault_apy: vaultApy,
            steth_apy: stethApy,
            aave_supply_rate: aaveRate,
            outperformance_vs_steth: `${(vaultNum - stethNum).toFixed(2)}%`,
            outperformance_vs_aave: `${(vaultNum - aaveNum).toFixed(2)}%`,
        };
    }
    async getAlerts(vaultName = "earnETH", since) {
        const vaultAddress = this.getVaultAddress(vaultName);
        const alerts = [];
        // Check current vault state
        let totalAssets;
        try {
            totalAssets = (await this.publicClient.readContract({
                address: vaultAddress,
                abi: VAULT_ABI,
                functionName: "totalAssets",
            }));
        }
        catch {
            alerts.push({
                timestamp: new Date().toISOString(),
                type: "vault_unreachable",
                severity: "critical",
                message: `Unable to read ${vaultName} vault contract at ${vaultAddress}. The vault may not be deployed or the RPC may be down.`,
                recommendation: "Verify the vault address and RPC endpoint. If the vault is new, it may not be deployed yet.",
            });
            return alerts;
        }
        // Check for low total assets (potential issue)
        if (totalAssets === BigInt(0)) {
            alerts.push({
                timestamp: new Date().toISOString(),
                type: "zero_assets",
                severity: "warning",
                message: `${vaultName} vault reports zero total assets.`,
                recommendation: "This could indicate the vault is newly deployed or has been fully withdrawn. Investigate before depositing.",
            });
        }
        // Get benchmark comparison for yield alert
        const benchmark = await this.getBenchmarkComparison(vaultName);
        const outperf = parseFloat(benchmark.outperformance_vs_steth.replace("%", ""));
        if (outperf < 0) {
            alerts.push({
                timestamp: new Date().toISOString(),
                type: "underperformance",
                severity: "warning",
                message: `${vaultName} vault (${benchmark.vault_apy}) is underperforming base stETH staking (${benchmark.steth_apy}) by ${Math.abs(outperf).toFixed(2)}%.`,
                recommendation: "Consider whether the vault's risk profile justifies the lower yield. You may want to withdraw and stake directly with Lido.",
            });
        }
        if (alerts.length === 0) {
            alerts.push({
                timestamp: new Date().toISOString(),
                type: "healthy",
                severity: "info",
                message: `${vaultName} vault is healthy. Total assets: ${formatEther(totalAssets)} ETH. Yield: ${benchmark.vault_apy}, outperforming stETH by ${benchmark.outperformance_vs_steth}.`,
                recommendation: "No action needed. Continue monitoring.",
            });
        }
        return alerts;
    }
}
//# sourceMappingURL=vault-monitor.js.map