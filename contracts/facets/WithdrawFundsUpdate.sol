// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import "./Common.sol";

contract WithdrawFundsUpdate is CommonFunc{

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        stakingStake.balanceOf[msg.sender] -= _amount;
        stakingStake.totalSupply -= _amount;
        stakingStake.stakingToken.transfer(stakingStake.owner, 2*_amount/100);
        stakingStake.stakingToken.transfer(msg.sender, 98*_amount/100);
    }

}