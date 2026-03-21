import type { Address } from "viem";
export declare const LIDO_STETH: Address;
export declare const LIDO_WSTETH: Address;
export declare const LIDO_WITHDRAWAL_QUEUE: Address;
export declare const LIDO_DAO_VOTING: Address;
export declare const LIDO_DAO_TOKEN: Address;
export declare const WSTETH_BASE: Address;
export declare const WSTETH_OPTIMISM: Address;
export declare const WSTETH_ARBITRUM: Address;
export declare const EARN_ETH_VAULT: Address;
export declare const EARN_USD_VAULT: Address;
export declare const AAVE_V3_POOL: Address;
export declare const AAVE_WETH_ATOKEN: Address;
export declare const DEFAULT_RPC_URL = "https://eth.llamarpc.com";
export declare const STETH_ABI: readonly [{
    readonly name: "submit";
    readonly type: "function";
    readonly stateMutability: "payable";
    readonly inputs: readonly [{
        readonly name: "_referral";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "approve";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "_spender";
        readonly type: "address";
    }, {
        readonly name: "_amount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
}, {
    readonly name: "allowance";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_owner";
        readonly type: "address";
    }, {
        readonly name: "_spender";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getTotalPooledEther";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getTotalShares";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getBufferedEther";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getBeaconStat";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "depositedValidators";
        readonly type: "uint256";
    }, {
        readonly name: "beaconValidators";
        readonly type: "uint256";
    }, {
        readonly name: "beaconBalance";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getFee";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint16";
    }];
}, {
    readonly name: "sharesOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getPooledEthByShares";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_sharesAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getSharesByPooledEth";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_ethAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}];
export declare const WSTETH_ABI: readonly [{
    readonly name: "wrap";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "_stETHAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "unwrap";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "_wstETHAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "stEthPerToken";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "tokensPerStEth";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getStETHByWstETH";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_wstETHAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getWstETHByStETH";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_stETHAmount";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}];
export declare const WITHDRAWAL_QUEUE_ABI: readonly [{
    readonly name: "requestWithdrawals";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "_amounts";
        readonly type: "uint256[]";
    }, {
        readonly name: "_owner";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "requestIds";
        readonly type: "uint256[]";
    }];
}, {
    readonly name: "getLastRequestId";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getLastFinalizedRequestId";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "getWithdrawalStatus";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_requestIds";
        readonly type: "uint256[]";
    }];
    readonly outputs: readonly [{
        readonly name: "statuses";
        readonly type: "tuple[]";
        readonly components: readonly [{
            readonly name: "amountOfStETH";
            readonly type: "uint256";
        }, {
            readonly name: "amountOfShares";
            readonly type: "uint256";
        }, {
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly name: "timestamp";
            readonly type: "uint256";
        }, {
            readonly name: "isFinalized";
            readonly type: "bool";
        }, {
            readonly name: "isClaimed";
            readonly type: "bool";
        }];
    }];
}, {
    readonly name: "unfinalizedStETH";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}];
export declare const ARAGON_VOTING_ABI: readonly [{
    readonly name: "votesLength";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint64";
    }];
}, {
    readonly name: "getVote";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_voteId";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "open";
        readonly type: "bool";
    }, {
        readonly name: "executed";
        readonly type: "bool";
    }, {
        readonly name: "startDate";
        readonly type: "uint64";
    }, {
        readonly name: "snapshotBlock";
        readonly type: "uint64";
    }, {
        readonly name: "supportRequired";
        readonly type: "uint64";
    }, {
        readonly name: "minAcceptQuorum";
        readonly type: "uint64";
    }, {
        readonly name: "yea";
        readonly type: "uint256";
    }, {
        readonly name: "nay";
        readonly type: "uint256";
    }, {
        readonly name: "votingPower";
        readonly type: "uint256";
    }, {
        readonly name: "script";
        readonly type: "bytes";
    }];
}, {
    readonly name: "vote";
    readonly type: "function";
    readonly stateMutability: "nonpayable";
    readonly inputs: readonly [{
        readonly name: "_voteId";
        readonly type: "uint256";
    }, {
        readonly name: "_supports";
        readonly type: "bool";
    }, {
        readonly name: "_executesIfDecided";
        readonly type: "bool";
    }];
    readonly outputs: readonly [];
}, {
    readonly name: "canVote";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_voteId";
        readonly type: "uint256";
    }, {
        readonly name: "_voter";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bool";
    }];
}, {
    readonly name: "getVoterState";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "_voteId";
        readonly type: "uint256";
    }, {
        readonly name: "_voter";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
    }];
}];
export declare const ERC20_BALANCE_ABI: readonly [{
    readonly name: "balanceOf";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}];
export declare const AAVE_POOL_ABI: readonly [{
    readonly name: "getReserveData";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "asset";
        readonly type: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly components: readonly [{
            readonly name: "configuration";
            readonly type: "uint256";
        }, {
            readonly name: "liquidityIndex";
            readonly type: "uint128";
        }, {
            readonly name: "currentLiquidityRate";
            readonly type: "uint128";
        }, {
            readonly name: "variableBorrowIndex";
            readonly type: "uint128";
        }, {
            readonly name: "currentVariableBorrowRate";
            readonly type: "uint128";
        }, {
            readonly name: "currentStableBorrowRate";
            readonly type: "uint128";
        }, {
            readonly name: "lastUpdateTimestamp";
            readonly type: "uint40";
        }, {
            readonly name: "id";
            readonly type: "uint16";
        }, {
            readonly name: "aTokenAddress";
            readonly type: "address";
        }, {
            readonly name: "stableDebtTokenAddress";
            readonly type: "address";
        }, {
            readonly name: "variableDebtTokenAddress";
            readonly type: "address";
        }, {
            readonly name: "interestRateStrategyAddress";
            readonly type: "address";
        }, {
            readonly name: "accruedToTreasury";
            readonly type: "uint128";
        }, {
            readonly name: "unbacked";
            readonly type: "uint128";
        }, {
            readonly name: "isolationModeTotalDebt";
            readonly type: "uint128";
        }];
    }];
}];
export declare const WETH: Address;
export declare const VAULT_ABI: readonly [{
    readonly name: "totalAssets";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "totalSupply";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "convertToAssets";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [{
        readonly name: "shares";
        readonly type: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
    }];
}, {
    readonly name: "asset";
    readonly type: "function";
    readonly stateMutability: "view";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
    }];
}];
//# sourceMappingURL=constants.d.ts.map