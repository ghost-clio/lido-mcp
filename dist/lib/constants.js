// ── Ethereum Mainnet Contract Addresses ──────────────────────────────────────
export const LIDO_STETH = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";
export const LIDO_WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
export const LIDO_WITHDRAWAL_QUEUE = "0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1";
export const LIDO_DAO_VOTING = "0x2e59A20f205bB85a89C53f1936454680651E618e";
export const LIDO_DAO_TOKEN = "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32";
// ── wstETH on L2s ───────────────────────────────────────────────────────────
export const WSTETH_BASE = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";
export const WSTETH_OPTIMISM = "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb";
export const WSTETH_ARBITRUM = "0x5979D7b546E38E414F7E9822514be443A4800529";
// ── Vault Addresses (Lido Earn — Steakhouse / MEV Capital) ──────────────────
export const EARN_ETH_VAULT = "0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc";
export const EARN_USD_VAULT = "0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB";
// ── External Protocol Addresses (for vault benchmarking) ────────────────────
export const AAVE_V3_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
export const AAVE_WETH_ATOKEN = "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8";
// ── RPC ─────────────────────────────────────────────────────────────────────
export const DEFAULT_RPC_URL = "https://eth.llamarpc.com";
// ── ABIs ────────────────────────────────────────────────────────────────────
export const STETH_ABI = [
    {
        name: "submit",
        type: "function",
        stateMutability: "payable",
        inputs: [{ name: "_referral", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "_spender", type: "address" },
            { name: "_amount", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "_owner", type: "address" },
            { name: "_spender", type: "address" },
        ],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getTotalPooledEther",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getTotalShares",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getBufferedEther",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getBeaconStat",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [
            { name: "depositedValidators", type: "uint256" },
            { name: "beaconValidators", type: "uint256" },
            { name: "beaconBalance", type: "uint256" },
        ],
    },
    {
        name: "getFee",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint16" }],
    },
    {
        name: "sharesOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getPooledEthByShares",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_sharesAmount", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getSharesByPooledEth",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_ethAmount", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
];
export const WSTETH_ABI = [
    {
        name: "wrap",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "_stETHAmount", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "unwrap",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "_wstETHAmount", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "stEthPerToken",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "tokensPerStEth",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getStETHByWstETH",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_wstETHAmount", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getWstETHByStETH",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_stETHAmount", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
];
export const WITHDRAWAL_QUEUE_ABI = [
    {
        name: "requestWithdrawals",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "_amounts", type: "uint256[]" },
            { name: "_owner", type: "address" },
        ],
        outputs: [{ name: "requestIds", type: "uint256[]" }],
    },
    {
        name: "getLastRequestId",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getLastFinalizedRequestId",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "getWithdrawalStatus",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_requestIds", type: "uint256[]" }],
        outputs: [
            {
                name: "statuses",
                type: "tuple[]",
                components: [
                    { name: "amountOfStETH", type: "uint256" },
                    { name: "amountOfShares", type: "uint256" },
                    { name: "owner", type: "address" },
                    { name: "timestamp", type: "uint256" },
                    { name: "isFinalized", type: "bool" },
                    { name: "isClaimed", type: "bool" },
                ],
            },
        ],
    },
    {
        name: "unfinalizedStETH",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
];
export const ARAGON_VOTING_ABI = [
    {
        name: "votesLength",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint64" }],
    },
    {
        name: "getVote",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "_voteId", type: "uint256" }],
        outputs: [
            { name: "open", type: "bool" },
            { name: "executed", type: "bool" },
            { name: "startDate", type: "uint64" },
            { name: "snapshotBlock", type: "uint64" },
            { name: "supportRequired", type: "uint64" },
            { name: "minAcceptQuorum", type: "uint64" },
            { name: "yea", type: "uint256" },
            { name: "nay", type: "uint256" },
            { name: "votingPower", type: "uint256" },
            { name: "script", type: "bytes" },
        ],
    },
    {
        name: "vote",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "_voteId", type: "uint256" },
            { name: "_supports", type: "bool" },
            { name: "_executesIfDecided", type: "bool" },
        ],
        outputs: [],
    },
    {
        name: "canVote",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "_voteId", type: "uint256" },
            { name: "_voter", type: "address" },
        ],
        outputs: [{ name: "", type: "bool" }],
    },
    {
        name: "getVoterState",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "_voteId", type: "uint256" },
            { name: "_voter", type: "address" },
        ],
        outputs: [{ name: "", type: "uint8" }],
    },
];
export const ERC20_BALANCE_ABI = [
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }],
    },
];
export const AAVE_POOL_ABI = [
    {
        name: "getReserveData",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "asset", type: "address" }],
        outputs: [
            {
                name: "",
                type: "tuple",
                components: [
                    { name: "configuration", type: "uint256" },
                    { name: "liquidityIndex", type: "uint128" },
                    { name: "currentLiquidityRate", type: "uint128" },
                    { name: "variableBorrowIndex", type: "uint128" },
                    { name: "currentVariableBorrowRate", type: "uint128" },
                    { name: "currentStableBorrowRate", type: "uint128" },
                    { name: "lastUpdateTimestamp", type: "uint40" },
                    { name: "id", type: "uint16" },
                    { name: "aTokenAddress", type: "address" },
                    { name: "stableDebtTokenAddress", type: "address" },
                    { name: "variableDebtTokenAddress", type: "address" },
                    { name: "interestRateStrategyAddress", type: "address" },
                    { name: "accruedToTreasury", type: "uint128" },
                    { name: "unbacked", type: "uint128" },
                    { name: "isolationModeTotalDebt", type: "uint128" },
                ],
            },
        ],
    },
];
// WETH address for Aave lookups
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
// Lido Earn vault ABI (simplified — ERC-4626 compatible)
export const VAULT_ABI = [
    {
        name: "totalAssets",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "totalSupply",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "convertToAssets",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "shares", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }],
    },
    {
        name: "asset",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "address" }],
    },
];
//# sourceMappingURL=constants.js.map