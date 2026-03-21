import { createPublicClient, createWalletClient, http, parseEther, formatEther, } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { LIDO_STETH, LIDO_WSTETH, LIDO_WITHDRAWAL_QUEUE, LIDO_DAO_VOTING, STETH_ABI, WSTETH_ABI, WITHDRAWAL_QUEUE_ABI, ARAGON_VOTING_ABI, DEFAULT_RPC_URL, } from "./constants.js";
export class LidoClient {
    publicClient;
    walletClient = null;
    account = null;
    constructor(rpcUrl) {
        this.publicClient = createPublicClient({
            chain: mainnet,
            transport: http(rpcUrl ?? process.env.ETH_RPC_URL ?? DEFAULT_RPC_URL),
        });
    }
    getWalletClient() {
        const pk = process.env.ETH_PRIVATE_KEY;
        if (!pk) {
            throw new Error("ETH_PRIVATE_KEY environment variable is required for write operations. " +
                "Set it to a hex-encoded private key (with or without 0x prefix).");
        }
        if (!this.walletClient) {
            this.account = privateKeyToAccount(pk.startsWith("0x") ? pk : `0x${pk}`);
            this.walletClient = createWalletClient({
                account: this.account,
                chain: mainnet,
                transport: http(process.env.ETH_RPC_URL ?? DEFAULT_RPC_URL),
            });
        }
        return { wallet: this.walletClient, account: this.account };
    }
    // ── Staking ─────────────────────────────────────────────────────────────
    async stake(amountEth, dryRun) {
        const value = parseEther(amountEth);
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
            args: ["0x0000000000000000000000000000000000000000"],
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
    async unstake(amountStEth, dryRun) {
        const amount = parseEther(amountStEth);
        const { account } = this.getWalletClient();
        if (dryRun) {
            // Check allowance
            const allowance = (await this.publicClient.readContract({
                address: LIDO_STETH,
                abi: STETH_ABI,
                functionName: "allowance",
                args: [account.address, LIDO_WITHDRAWAL_QUEUE],
            }));
            const needsApproval = allowance < amount;
            const gas = await this.publicClient.estimateGas({
                account: account.address,
                to: LIDO_WITHDRAWAL_QUEUE,
                data: "0x00", // placeholder — real estimate needs approval first
            }).catch(() => BigInt(300_000)); // fallback gas estimate
            return {
                simulated: true,
                withdrawal_amount: amountStEth,
                gas_estimate: gas.toString(),
                message: `Dry run: requesting withdrawal of ${amountStEth} stETH. ` +
                    (needsApproval
                        ? `Needs stETH approval to WithdrawalQueue first. `
                        : `stETH already approved. `) +
                    `Estimated gas: ${gas}. Note: withdrawals take 1-5 days to finalize.`,
            };
        }
        const { wallet } = this.getWalletClient();
        // Approve stETH for the withdrawal queue
        const allowance = (await this.publicClient.readContract({
            address: LIDO_STETH,
            abi: STETH_ABI,
            functionName: "allowance",
            args: [account.address, LIDO_WITHDRAWAL_QUEUE],
        }));
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
    async wrap(amountStEth, dryRun) {
        const amount = parseEther(amountStEth);
        // Calculate expected wstETH output
        const wstethAmount = (await this.publicClient.readContract({
            address: LIDO_WSTETH,
            abi: WSTETH_ABI,
            functionName: "getWstETHByStETH",
            args: [amount],
        }));
        const wstethFormatted = formatEther(wstethAmount);
        if (dryRun) {
            const { account } = this.getWalletClient();
            const allowance = (await this.publicClient.readContract({
                address: LIDO_STETH,
                abi: STETH_ABI,
                functionName: "allowance",
                args: [account.address, LIDO_WSTETH],
            }));
            const needsApproval = allowance < amount;
            return {
                simulated: true,
                wsteth_amount: wstethFormatted,
                gas_estimate: "150000",
                message: `Dry run: wrapping ${amountStEth} stETH → ~${wstethFormatted} wstETH. ` +
                    (needsApproval ? `Needs stETH approval to wstETH contract first.` : `stETH already approved.`),
            };
        }
        const { wallet, account } = this.getWalletClient();
        // Approve stETH
        const allowance = (await this.publicClient.readContract({
            address: LIDO_STETH,
            abi: STETH_ABI,
            functionName: "allowance",
            args: [account.address, LIDO_WSTETH],
        }));
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
    async unwrap(amountWstEth, dryRun) {
        const amount = parseEther(amountWstEth);
        const stethAmount = (await this.publicClient.readContract({
            address: LIDO_WSTETH,
            abi: WSTETH_ABI,
            functionName: "getStETHByWstETH",
            args: [amount],
        }));
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
    async getBalances(address) {
        const [ethBal, stethBal, wstethBal] = await Promise.all([
            this.publicClient.getBalance({ address }),
            this.publicClient.readContract({
                address: LIDO_STETH,
                abi: STETH_ABI,
                functionName: "balanceOf",
                args: [address],
            }),
            this.publicClient.readContract({
                address: LIDO_WSTETH,
                abi: WSTETH_ABI,
                functionName: "balanceOf",
                args: [address],
            }),
        ]);
        let wstethAsSteth = BigInt(0);
        if (wstethBal > 0n) {
            wstethAsSteth = (await this.publicClient.readContract({
                address: LIDO_WSTETH,
                abi: WSTETH_ABI,
                functionName: "getStETHByWstETH",
                args: [wstethBal],
            }));
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
    async getProtocolStats() {
        const [totalPooled, beaconStat, buffered, wstethPerSteth, lastRequestId, lastFinalizedId, unfinalizedStETH] = await Promise.all([
            this.publicClient.readContract({
                address: LIDO_STETH,
                abi: STETH_ABI,
                functionName: "getTotalPooledEther",
            }),
            this.publicClient.readContract({
                address: LIDO_STETH,
                abi: STETH_ABI,
                functionName: "getBeaconStat",
            }),
            this.publicClient.readContract({
                address: LIDO_STETH,
                abi: STETH_ABI,
                functionName: "getBufferedEther",
            }),
            this.publicClient.readContract({
                address: LIDO_WSTETH,
                abi: WSTETH_ABI,
                functionName: "stEthPerToken",
            }),
            this.publicClient.readContract({
                address: LIDO_WITHDRAWAL_QUEUE,
                abi: WITHDRAWAL_QUEUE_ABI,
                functionName: "getLastRequestId",
            }),
            this.publicClient.readContract({
                address: LIDO_WITHDRAWAL_QUEUE,
                abi: WITHDRAWAL_QUEUE_ABI,
                functionName: "getLastFinalizedRequestId",
            }),
            this.publicClient.readContract({
                address: LIDO_WITHDRAWAL_QUEUE,
                abi: WITHDRAWAL_QUEUE_ABI,
                functionName: "unfinalizedStETH",
            }),
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
    async getProposals(limit = 5, statusFilter) {
        const totalVotes = (await this.publicClient.readContract({
            address: LIDO_DAO_VOTING,
            abi: ARAGON_VOTING_ABI,
            functionName: "votesLength",
        }));
        const total = Number(totalVotes);
        const proposals = [];
        // Fetch recent proposals (iterate backwards from most recent)
        const fetchCount = Math.min(limit * 3, 20); // fetch extra to filter
        for (let i = total - 1; i >= Math.max(0, total - fetchCount); i--) {
            try {
                const vote = (await this.publicClient.readContract({
                    address: LIDO_DAO_VOTING,
                    abi: ARAGON_VOTING_ABI,
                    functionName: "getVote",
                    args: [BigInt(i)],
                }));
                const [open, executed, startDate, , , , yea, nay, votingPower] = vote;
                let status;
                if (open) {
                    status = "active";
                }
                else if (executed) {
                    status = "passed";
                }
                else {
                    status = "rejected";
                }
                if (statusFilter && status !== statusFilter)
                    continue;
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
                if (proposals.length >= limit)
                    break;
            }
            catch {
                continue; // skip any votes that fail to decode
            }
        }
        return proposals;
    }
    async vote(proposalId, support, dryRun) {
        const { account } = this.getWalletClient();
        // Check if user can vote
        const canVote = (await this.publicClient.readContract({
            address: LIDO_DAO_VOTING,
            abi: ARAGON_VOTING_ABI,
            functionName: "canVote",
            args: [BigInt(proposalId), account.address],
        }));
        if (!canVote) {
            return {
                simulated: dryRun,
                message: `Cannot vote on proposal #${proposalId}. Either the vote is closed, you have no LDO tokens, or you already voted.`,
            };
        }
        if (dryRun) {
            return {
                simulated: true,
                message: `Dry run: would vote ${support ? "YES" : "NO"} on proposal #${proposalId}. You are eligible to vote.`,
            };
        }
        const { wallet } = this.getWalletClient();
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
//# sourceMappingURL=lido.js.map