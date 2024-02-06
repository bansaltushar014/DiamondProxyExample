// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import "./Common.sol";

contract StakingRewards is CommonFunc{

    function stake(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        stakingStake.stakingToken.transferFrom(msg.sender, address(this), _amount);
        stakingStake.balanceOf[msg.sender] += _amount;
        stakingStake.totalSupply += _amount;
    }

}
