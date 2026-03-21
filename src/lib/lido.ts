import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  isAddress,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  type Transport,
  type Chain,
} from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import {
  LIDO_STETH,
  LIDO_WSTETH,
  LIDO_WITHDRAWAL_QUEUE,
  LIDO_DAO_VOTING,
  STETH_ABI,
  WSTETH_ABI,
  WITHDRAWAL_QUEUE_ABI,
  ARAGON_VOTING_ABI,
  DEFAULT_RPC_URL,
} from "./constants.js";

export class LidoClient {
  public readonly publicClient: PublicClient<Transport, Chain>;
  private walletClient: WalletClient | null = null;
  private account: ReturnType<typeof privateKeyToAccount> | null = null;

  constructor(rpcUrl?: string) {
    this.publicClient = createPublicClient({
      chain: mainnet,
      transport: http(rpcUrl ?? process.env.ETH_RPC_URL ?? DEFAULT_RPC_URL),
    });
  }

  /** Validate and parse an ETH amount string. Rejects zero, negative, and non-numeric values. */
  private parseAmount(amountStr: string, label: string): bigint {
    const num = Number(amountStr);
    if (isNaN(num) || num <= 0) {
      throw new Error(`Invalid ${label}: "${amountStr}". Must be a positive number (e.g. "1.5").`);
    }
    return parseEther(amountStr);
  }

  /** Validate an Ethereum address. */
  static validateAddress(address: string): Address {
    if (!isAddress(address)) {
      throw new Error(`Invalid Ethereum address: "${address}". Must be a 0x-prefixed 40-hex-character string.`);
    }
    return address as Address;
  }

  private getWalletClient(): {
    wallet: WalletClient;
    account: ReturnType<typeof privateKeyToAccount>;
  } {
    const pk = process.env.ETH_PRIVATE_KEY;
    if (!pk) {
      throw new Error(
        "ETH_PRIVATE_KEY environment variable is required for write operations. " +
          "Set it to a hex-encoded private key (with or without 0x prefix)."
      );
    }
    if (!this.walletClient) {
      this.account = privateKeyToAccount(
        pk.startsWith("0x") ? (pk as `0x${string}`) : (`0x${pk}` as `0x${string}`)
      );
      this.walletClient = createWalletClient({
        account: this.account,
        chain: mainnet,
        transport: http(process.env.ETH_RPC_URL ?? DEFAULT_RPC_URL),
      });
    }
    return { wallet: this.walletClient, account: this.account! };
  }

  // ── Staking ─────────────────────────────────────────────────────────────

  async stake(
    amountEth: string,
    dryRun: boolean
  ): Promise<{
    tx_hash?: Hash;
    simulated: boolean;
    steth_amount: string;
    gas_estimate: string;
    message: string;
  }> {
    const value = this.parseAmount(amountEth, "stake amount");

    if (dryRun) {
      const gas = await this.publicClient.estimateGas({
        to: LIDO_STETH,
        value,
        data: "0xa1903eab0000000000000000000000000000000000000000000000000000000000000000", // submit(address(0))
      });
      return {
        simulated: true,
        steth_amount: amountEth,
        gas_estimate: gas.toString(),
        message: `Dry run: staking ${amountEth} ETH would mint ~${amountEth} stETH. Estimated gas: ${gas}`,
      };
    }

    const { wallet, account } = this.getWalletClient();
    const hash = await wallet.writeContract({
      address: LIDO_STETH,
      abi: STETH_ABI,
      functionName: "submit",
      args: ["0x0000000000000000000000000000000000000000" as Address],
      value,
      account,
      chain: mainnet,
    });

    return {
      tx_hash: hash,
      simulated: false,
      steth_amount: amountEth,
      gas_estimate: "0",
      message: `Staked ${amountEth} ETH → stETH. Tx: ${hash}`,
    };
  }

  // ── Unstaking ───────────────────────────────────────────────────────────

  async unstake(
    amountStEth: string,
    dryRun: boolean
  ): Promise<{
    tx_hash?: Hash;
    simulated: boolean;
    request_id?: string;
    withdrawal_amount: string;
    gas_estimate: string;
    message: string;
  }> {
    const amount = this.parseAmount(amountStEth, "unstake amount");

    if (dryRun) {
      // Dry run without requiring a private key
      const gas = BigInt(350_000); // Withdrawal request gas is ~300-400K
      let approvalNote = "Cannot check allowance without ETH_PRIVATE_KEY.";

      // If we have a key, check allowance
      const pk = process.env.ETH_PRIVATE_KEY;
      if (pk) {
        const { account } = this.getWalletClient();
        const allowance = (await this.publicClient.readContract({
          address: LIDO_STETH,
          abi: STETH_ABI,
          functionName: "allowance",
          args: [account.address, LIDO_WITHDRAWAL_QUEUE],
        })) as bigint;

        approvalNote = allowance < amount
          ? "Needs stETH approval to WithdrawalQueue first."
          : "stETH already approved.";
      }

      return {
        simulated: true,
        withdrawal_amount: amountStEth,
        gas_estimate: gas.toString(),
        message: `Dry run: requesting withdrawal of ${amountStEth} stETH. ` +
          `${approvalNote} ` +
          `Estimated gas: ${gas}. Note: withdrawals take 1-5 days to finalize.`,
      };
    }

    const { wallet, account } = this.getWalletClient();

    // Approve stETH for the withdrawal queue
    const allowance = (await this.publicClient.readContract({
      address: LIDO_STETH,
      abi: STETH_ABI,
      functionName: "allowance",
      args: [account.address, LIDO_WITHDRAWAL_QUEUE],
    })) as bigint;

    if (allowance < amount) {
      const approveTx = await wallet.writeContract({
        address: LIDO_STETH,
        abi: STETH_ABI,
        functionName: "approve",
        args: [LIDO_WITHDRAWAL_QUEUE, amount],
        account,
        chain: mainnet,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: approveTx });
    }

    const hash = await wallet.writeContract({
      address: LIDO_WITHDRAWAL_QUEUE,
      abi: WITHDRAWAL_QUEUE_ABI,
      functionName: "requestWithdrawals",
      args: [[amount], account.address],
      account,
      chain: mainnet,
    });

    return {
      tx_hash: hash,
      simulated: false,
      withdrawal_amount: amountStEth,
      gas_estimate: "0",
      message: `Requested withdrawal of ${amountStEth} stETH. Tx: ${hash}. Withdrawal will take 1-5 days to finalize.`,
    };
  }

  // ── Wrap ────────────────────────────────────────────────────────────────

  async wrap(
    amountStEth: string,
    dryRun: boolean
  ): Promise<{
    tx_hash?: Hash;
    simulated: boolean;
    wsteth_amount: string;
    gas_estimate: string;
    message: string;
  }> {
    const amount = this.parseAmount(amountStEth, "wrap amount");

    // Calculate expected wstETH output
    const wstethAmount = (await this.publicClient.readContract({
      address: LIDO_WSTETH,
      abi: WSTETH_ABI,
      functionName: "getWstETHByStETH",
      args: [amount],
    })) as bigint;
    const wstethFormatted = formatEther(wstethAmount);

    if (dryRun) {
      let approvalNote = "Cannot check allowance without ETH_PRIVATE_KEY.";
      const pk = process.env.ETH_PRIVATE_KEY;
      if (pk) {
        const { account } = this.getWalletClient();
        const allowance = (await this.publicClient.readContract({
          address: LIDO_STETH,
          abi: STETH_ABI,
          functionName: "allowance",
          args: [account.address, LIDO_WSTETH],
        })) as bigint;
        approvalNote = allowance < amount
          ? "Needs stETH approval to wstETH contract first."
          : "stETH already approved.";
      }

      return {
        simulated: true,
        wsteth_amount: wstethFormatted,
        gas_estimate: "150000",
        message: `Dry run: wrapping ${amountStEth} stETH → ~${wstethFormatted} wstETH. ${approvalNote}`,
      };
    }

    const { wallet, account } = this.getWalletClient();

    // Approve stETH
    const allowance = (await this.publicClient.readContract({
      address: LIDO_STETH,
      abi: STETH_ABI,
      functionName: "allowance",
      args: [account.address, LIDO_WSTETH],
    })) as bigint;

    if (allowance < amount) {
      const approveTx = await wallet.writeContract({
        address: LIDO_STETH,
        abi: STETH_ABI,
        functionName: "approve",
        args: [LIDO_WSTETH, amount],
        account,
        chain: mainnet,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: approveTx });
    }

    const hash = await wallet.writeContract({
      address: LIDO_WSTETH,
      abi: WSTETH_ABI,
      functionName: "wrap",
      args: [amount],
      account,
      chain: mainnet,
    });

    return {
      tx_hash: hash,
      simulated: false,
      wsteth_amount: wstethFormatted,
      gas_estimate: "0",
      message: `Wrapped ${amountStEth} stETH → ${wstethFormatted} wstETH. Tx: ${hash}`,
    };
  }

  // ── Unwrap ──────────────────────────────────────────────────────────────

  async unwrap(
    amountWstEth: string,
    dryRun: boolean
  ): Promise<{
    tx_hash?: Hash;
    simulated: boolean;
    steth_amount: string;
    gas_estimate: string;
    message: string;
  }> {
    const amount = this.parseAmount(amountWstEth, "unwrap amount");

    const stethAmount = (await this.publicClient.readContract({
      address: LIDO_WSTETH,
      abi: WSTETH_ABI,
      functionName: "getStETHByWstETH",
      args: [amount],
    })) as bigint;
    const stethFormatted = formatEther(stethAmount);

    if (dryRun) {
      return {
        simulated: true,
        steth_amount: stethFormatted,
        gas_estimate: "100000",
        message: `Dry run: unwrapping ${amountWstEth} wstETH → ~${stethFormatted} stETH.`,
      };
    }

    const { wallet, account } = this.getWalletClient();
    const hash = await wallet.writeContract({
      address: LIDO_WSTETH,
      abi: WSTETH_ABI,
      functionName: "unwrap",
      args: [amount],
      account,
      chain: mainnet,
    });

    return {
      tx_hash: hash,
      simulated: false,
      steth_amount: stethFormatted,
      gas_estimate: "0",
      message: `Unwrapped ${amountWstEth} wstETH → ${stethFormatted} stETH. Tx: ${hash}`,
    };
  }

  // ── Balances ────────────────────────────────────────────────────────────

  async getBalances(address: Address): Promise<{
    eth: string;
    steth: string;
    wsteth: string;
    wsteth_as_steth: string;
    total_steth_equivalent: string;
  }> {
    const [ethBal, stethBal, wstethBal] = await Promise.all([
      this.publicClient.getBalance({ address }),
      this.publicClient.readContract({
        address: LIDO_STETH,
        abi: STETH_ABI,
        functionName: "balanceOf",
        args: [address],
      }) as Promise<bigint>,
      this.publicClient.readContract({
        address: LIDO_WSTETH,
        abi: WSTETH_ABI,
        functionName: "balanceOf",
        args: [address],
      }) as Promise<bigint>,
    ]);

    let wstethAsSteth = BigInt(0);
    if (wstethBal > 0n) {
      wstethAsSteth = (await this.publicClient.readContract({
        address: LIDO_WSTETH,
        abi: WSTETH_ABI,
        functionName: "getStETHByWstETH",
        args: [wstethBal],
      })) as bigint;
    }

    const totalStethEquivalent = stethBal + wstethAsSteth;

    return {
      eth: formatEther(ethBal),
      steth: formatEther(stethBal),
      wsteth: formatEther(wstethBal),
      wsteth_as_steth: formatEther(wstethAsSteth),
      total_steth_equivalent: formatEther(totalStethEquivalent),
    };
  }

  // ── Protocol Stats ──────────────────────────────────────────────────────

  async getProtocolStats(): Promise<{
    total_staked_eth: string;
    steth_apy: string;
    wsteth_price_steth: string;
    total_validators: string;
    withdrawal_queue_pending: string;
    buffered_eth: string;
  }> {
    const [totalPooled, beaconStat, buffered, wstethPerSteth, lastRequestId, lastFinalizedId, unfinalizedStETH] =
      await Promise.all([
        this.publicClient.readContract({
          address: LIDO_STETH,
          abi: STETH_ABI,
          functionName: "getTotalPooledEther",
        }) as Promise<bigint>,
        this.publicClient.readContract({
          address: LIDO_STETH,
          abi: STETH_ABI,
          functionName: "getBeaconStat",
        }) as Promise<[bigint, bigint, bigint]>,
        this.publicClient.readContract({
          address: LIDO_STETH,
          abi: STETH_ABI,
          functionName: "getBufferedEther",
        }) as Promise<bigint>,
        this.publicClient.readContract({
          address: LIDO_WSTETH,
          abi: WSTETH_ABI,
          functionName: "stEthPerToken",
        }) as Promise<bigint>,
        this.publicClient.readContract({
          address: LIDO_WITHDRAWAL_QUEUE,
          abi: WITHDRAWAL_QUEUE_ABI,
          functionName: "getLastRequestId",
        }) as Promise<bigint>,
        this.publicClient.readContract({
          address: LIDO_WITHDRAWAL_QUEUE,
          abi: WITHDRAWAL_QUEUE_ABI,
          functionName: "getLastFinalizedRequestId",
        }) as Promise<bigint>,
        this.publicClient.readContract({
          address: LIDO_WITHDRAWAL_QUEUE,
          abi: WITHDRAWAL_QUEUE_ABI,
          functionName: "unfinalizedStETH",
        }) as Promise<bigint>,
      ]);

    const pendingRequests = lastRequestId - lastFinalizedId;

    return {
      total_staked_eth: formatEther(totalPooled),
      steth_apy: "~3.0%", // APY comes from oracle reports — approximate from on-chain
      wsteth_price_steth: formatEther(wstethPerSteth),
      total_validators: beaconStat[1].toString(),
      withdrawal_queue_pending: `${pendingRequests} requests (${formatEther(unfinalizedStETH)} stETH)`,
      buffered_eth: formatEther(buffered),
    };
  }

  // ── Governance ──────────────────────────────────────────────────────────

  async getProposals(
    limit: number = 5,
    statusFilter?: "active" | "passed" | "rejected"
  ): Promise<
    Array<{
      id: number;
      open: boolean;
      executed: boolean;
      start_date: string;
      yea: string;
      nay: string;
      voting_power: string;
      status: string;
      support_pct: string;
    }>
  > {
    const totalVotes = (await this.publicClient.readContract({
      address: LIDO_DAO_VOTING,
      abi: ARAGON_VOTING_ABI,
      functionName: "votesLength",
    })) as bigint;

    const total = Number(totalVotes);
    const proposals: Array<{
      id: number;
      open: boolean;
      executed: boolean;
      start_date: string;
      yea: string;
      nay: string;
      voting_power: string;
      status: string;
      support_pct: string;
    }> = [];

    // Fetch recent proposals (iterate backwards from most recent)
    const fetchCount = Math.min(limit * 3, 20); // fetch extra to filter
    for (let i = total - 1; i >= Math.max(0, total - fetchCount); i--) {
      try {
        const vote = (await this.publicClient.readContract({
          address: LIDO_DAO_VOTING,
          abi: ARAGON_VOTING_ABI,
          functionName: "getVote",
          args: [BigInt(i)],
        })) as [boolean, boolean, bigint, bigint, bigint, bigint, bigint, bigint, bigint, string];

        const [open, executed, startDate, , , , yea, nay, votingPower] = vote;

        let status: string;
        if (open) {
          status = "active";
        } else if (executed) {
          status = "passed";
        } else {
          status = "rejected";
        }

        if (statusFilter && status !== statusFilter) continue;

        const yeaNum = Number(formatEther(yea));
        const nayNum = Number(formatEther(nay));
        const totalVoted = yeaNum + nayNum;
        const supportPct = totalVoted > 0 ? ((yeaNum / totalVoted) * 100).toFixed(2) : "0.00";

        proposals.push({
          id: i,
          open,
          executed,
          start_date: new Date(Number(startDate) * 1000).toISOString(),
          yea: formatEther(yea),
          nay: formatEther(nay),
          voting_power: formatEther(votingPower),
          status,
          support_pct: `${supportPct}%`,
        });

        if (proposals.length >= limit) break;
      } catch {
        continue; // skip any votes that fail to decode
      }
    }

    return proposals;
  }

  async vote(
    proposalId: number,
    support: boolean,
    dryRun: boolean
  ): Promise<{
    tx_hash?: Hash;
    simulated: boolean;
    message: string;
  }> {
    if (dryRun) {
      // Check eligibility if we have a key, otherwise just report proposal status
      const pk = process.env.ETH_PRIVATE_KEY;
      if (pk) {
        const { account } = this.getWalletClient();
        const canVote = (await this.publicClient.readContract({
          address: LIDO_DAO_VOTING,
          abi: ARAGON_VOTING_ABI,
          functionName: "canVote",
          args: [BigInt(proposalId), account.address],
        })) as boolean;

        if (!canVote) {
          return {
            simulated: true,
            message: `Cannot vote on proposal #${proposalId}. Either the vote is closed, you have no LDO tokens, or you already voted.`,
          };
        }
        return {
          simulated: true,
          message: `Dry run: would vote ${support ? "YES" : "NO"} on proposal #${proposalId}. You are eligible to vote.`,
        };
      }

      return {
        simulated: true,
        message: `Dry run: would vote ${support ? "YES" : "NO"} on proposal #${proposalId}. Set ETH_PRIVATE_KEY to check eligibility.`,
      };
    }

    const { wallet, account } = this.getWalletClient();

    // Check if user can vote
    const canVote = (await this.publicClient.readContract({
      address: LIDO_DAO_VOTING,
      abi: ARAGON_VOTING_ABI,
      functionName: "canVote",
      args: [BigInt(proposalId), account.address],
    })) as boolean;

    if (!canVote) {
      return {
        simulated: false,
        message: `Cannot vote on proposal #${proposalId}. Either the vote is closed, you have no LDO tokens, or you already voted.`,
      };
    }
    const hash = await wallet.writeContract({
      address: LIDO_DAO_VOTING,
      abi: ARAGON_VOTING_ABI,
      functionName: "vote",
      args: [BigInt(proposalId), support, false],
      account,
      chain: mainnet,
    });

    return {
      tx_hash: hash,
      simulated: false,
      message: `Voted ${support ? "YES" : "NO"} on proposal #${proposalId}. Tx: ${hash}`,
    };
  }
}
