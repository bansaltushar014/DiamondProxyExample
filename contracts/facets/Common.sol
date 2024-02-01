// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import {StakingState} from "./AppStorage.sol";

contract CommonFunc {
    StakingState stakingStake;  

     modifier onlyOwner() {
        require(msg.sender == stakingStake.owner, "not authorized");
        _;
    }

    modifier updateReward(address _account) {
        stakingStake.rewardPerTokenStored = _rewardPerToken();
        stakingStake.updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            stakingStake.rewards[_account] = _earned(_account);
            stakingStake.userRewardPerTokenPaid[_account] = stakingStake.rewardPerTokenStored;
        }

        _;
    }

    function _earned(address _account) internal view returns (uint) {
        return
            ((stakingStake.balanceOf[_account] *
                (_rewardPerToken() - stakingStake.userRewardPerTokenPaid[_account])) / 1e18) +
            stakingStake.rewards[_account];
    }

    function lastTimeRewardApplicable() public view returns (uint) {
        return _min(stakingStake.finishAt, block.timestamp);
    }


    function _min(uint x, uint y) private pure returns (uint) {
        return x <= y ? x : y;
    }

    function _rewardPerToken() internal view returns (uint) {
        if (stakingStake.totalSupply == 0) {
            return stakingStake.rewardPerTokenStored;
        }

        return
            stakingStake.rewardPerTokenStored +
            (stakingStake.rewardRate * (lastTimeRewardApplicable() - stakingStake.updatedAt) * 1e18) /
            stakingStake.totalSupply;
    }

}