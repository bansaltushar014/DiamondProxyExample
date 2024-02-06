// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {IERC20} from "../interfaces/IERC20.sol";

struct StakingState {
        address owner;
        uint  duration;
        uint finishAt;
        uint updatedAt;
        uint rewardRate;
        uint rewardPerTokenStored;
        mapping(address => uint) userRewardPerTokenPaid;
        mapping(address => uint) rewards;
        uint totalSupply;
        mapping(address => uint) balanceOf;
        IERC20 stakingToken;
        IERC20 rewardsToken;
    }



