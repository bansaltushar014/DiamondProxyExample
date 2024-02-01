// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import {StakingState} from "./AppStorage.sol";
import "./Common.sol";

contract WithdrawFunds is CommonFunc{

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_amount > 0, "amount = 0");
        stakingStake.balanceOf[msg.sender] -= _amount;
        stakingStake.totalSupply -= _amount;
        stakingStake.stakingToken.transfer(msg.sender, _amount);
    }

}