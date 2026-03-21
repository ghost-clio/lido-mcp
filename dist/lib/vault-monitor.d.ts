import type { VaultHealth, BenchmarkComparison } from "../types.js";
export declare class VaultMonitor {
    private publicClient;
    constructor(rpcUrl?: string);
    private getVaultAddress;
    getVaultHealth(vaultName?: string): Promise<VaultHealth>;
    getBenchmarkComparison(vaultName?: string): Promise<BenchmarkComparison>;
    getAlerts(vaultName?: string, since?: number): Promise<Array<{
        timestamp: string;
        type: string;
        severity: "info" | "warning" | "critical";
        message: string;
        recommendation: string;
    }>>;
}
//# sourceMappingURL=vault-monitor.d.ts.map