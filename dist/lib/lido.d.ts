import { type Address, type Hash, type PublicClient, type Transport, type Chain } from "viem";
export declare class LidoClient {
    readonly publicClient: PublicClient<Transport, Chain>;
    private walletClient;
    private account;
    constructor(rpcUrl?: string);
    private getWalletClient;
    stake(amountEth: string, dryRun: boolean): Promise<{
        tx_hash?: Hash;
        simulated: boolean;
        steth_amount: string;
        gas_estimate: string;
        message: string;
    }>;
    unstake(amountStEth: string, dryRun: boolean): Promise<{
        tx_hash?: Hash;
        simulated: boolean;
        request_id?: string;
        withdrawal_amount: string;
        gas_estimate: string;
        message: string;
    }>;
    wrap(amountStEth: string, dryRun: boolean): Promise<{
        tx_hash?: Hash;
        simulated: boolean;
        wsteth_amount: string;
        gas_estimate: string;
        message: string;
    }>;
    unwrap(amountWstEth: string, dryRun: boolean): Promise<{
        tx_hash?: Hash;
        simulated: boolean;
        steth_amount: string;
        gas_estimate: string;
        message: string;
    }>;
    getBalances(address: Address): Promise<{
        eth: string;
        steth: string;
        wsteth: string;
        wsteth_as_steth: string;
        total_steth_equivalent: string;
    }>;
    getProtocolStats(): Promise<{
        total_staked_eth: string;
        steth_apy: string;
        wsteth_price_steth: string;
        total_validators: string;
        withdrawal_queue_pending: string;
        buffered_eth: string;
    }>;
    getProposals(limit?: number, statusFilter?: "active" | "passed" | "rejected"): Promise<Array<{
        id: number;
        open: boolean;
        executed: boolean;
        start_date: string;
        yea: string;
        nay: string;
        voting_power: string;
        status: string;
        support_pct: string;
    }>>;
    vote(proposalId: number, support: boolean, dryRun: boolean): Promise<{
        tx_hash?: Hash;
        simulated: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=lido.d.ts.map