import type { Address, Hash } from "viem";

export interface StakeParams {
  amount: string;
  dry_run: boolean;
}

export interface UnstakeParams {
  amount: string;
  dry_run: boolean;
}

export interface WrapParams {
  amount: string;
  dry_run: boolean;
}

export interface UnwrapParams {
  amount: string;
  dry_run: boolean;
}

export interface BalanceParams {
  address: string;
}

export interface RewardsParams {
  address: string;
  days?: number;
}

export interface ProposalsParams {
  status?: "active" | "passed" | "rejected";
  limit?: number;
}

export interface VoteParams {
  proposal_id: number;
  support: boolean;
  dry_run: boolean;
}

export interface VaultHealthParams {
  vault?: "earnETH" | "earnUSD";
}

export interface VaultAlertsParams {
  vault?: "earnETH" | "earnUSD";
  since?: number;
}

export interface VaultBenchmarkParams {
  vault?: "earnETH" | "earnUSD";
}

export interface StakeResult {
  tx_hash?: Hash;
  simulated?: boolean;
  steth_amount: string;
  gas_estimate?: string;
  message: string;
}

export interface UnstakeResult {
  tx_hash?: Hash;
  simulated?: boolean;
  request_id?: string;
  withdrawal_amount: string;
  gas_estimate?: string;
  message: string;
}

export interface WrapResult {
  tx_hash?: Hash;
  simulated?: boolean;
  wsteth_amount: string;
  gas_estimate?: string;
  message: string;
}

export interface UnwrapResult {
  tx_hash?: Hash;
  simulated?: boolean;
  steth_amount: string;
  gas_estimate?: string;
  message: string;
}

export interface BalanceResult {
  address: Address;
  eth: string;
  steth: string;
  wsteth: string;
  wsteth_as_steth: string;
  total_steth_equivalent: string;
  current_apy: string;
}

export interface ProtocolStats {
  total_staked_eth: string;
  steth_apy: string;
  steth_price_eth: string;
  wsteth_price_steth: string;
  total_validators: string;
  withdrawal_queue_length: string;
  buffered_eth: string;
}

export interface VaultHealth {
  vault: string;
  total_assets: string;
  current_apy: string;
  allocations: VaultAllocation[];
  benchmark_comparison: BenchmarkComparison;
}

export interface VaultAllocation {
  protocol: string;
  percentage: string;
  apy: string;
}

export interface BenchmarkComparison {
  vault_apy: string;
  steth_apy: string;
  aave_supply_rate: string;
  outperformance_vs_steth: string;
  outperformance_vs_aave: string;
}
