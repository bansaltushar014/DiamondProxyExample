// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import {StakingState} from "./AppStorage.sol";
import "./Common.sol";

contract Rewards is CommonFunc{

    function setInitialValue(address _stakingToken, address _rewardToken) public {
        stakingStake.owner = msg.sender;
        stakingStake.stakingToken =  IERC20(_stakingToken);
        stakingStake.rewardsToken = IERC20(_rewardToken);
    }

    function setRewardsDuration(uint _duration) external onlyOwner {
        require(stakingStake.finishAt < block.timestamp, "reward duration not finished");
        stakingStake.duration = _duration;
    }

    function notifyRewardAmount(
        uint _amount
    ) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= stakingStake.finishAt) {
            stakingStake.rewardRate = _amount / stakingStake.duration;
        } else {
            uint remainingRewards = (stakingStake.finishAt - block.timestamp) * stakingStake.rewardRate;
            stakingStake.rewardRate = (_amount + remainingRewards) / stakingStake.duration;
        }

        require(stakingStake.rewardRate > 0, "reward rate = 0");
        require(
            stakingStake.rewardRate * stakingStake.duration <= stakingStake.rewardsToken.balanceOf(address(this)),
            "reward amount > balance"
        );

        stakingStake.finishAt = block.timestamp + stakingStake.duration;
        stakingStake.updatedAt = block.timestamp;
    }

    function earned(address _account) public view returns (uint) {
        return _earned(_account);
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = stakingStake.rewards[msg.sender];
        if (reward > 0) {
            stakingStake.rewards[msg.sender] = 0;
            stakingStake.rewardsToken.transfer(msg.sender, reward);
        }
    }

    function rewardPerToken() internal view returns (uint) {
        return _rewardPerToken();
    }   
}