// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC20} from "../interfaces/IERC20.sol";
import {StakingState} from "./AppStorage.sol";

contract GetValues {
    StakingState stakingStake;  
    
    function _duration() public view returns (uint){
        return stakingStake.duration;
    }

    function _finishAt() public  view returns (uint){
        return stakingStake.finishAt;
    }

    function _updatedAt() public view returns (uint){
        return stakingStake.updatedAt;
    }

    function _rewardRate() public view returns (uint){
        return stakingStake.rewardRate;
    }

    function _rewardTokenStored() public view returns(uint){
        return stakingStake.rewardPerTokenStored;
    }

    function _userRewardPerTokenPain(address _addr) public  view returns(uint){
        return stakingStake.userRewardPerTokenPaid[_addr];
    }

    function _rewards(address _addr) public view returns (uint){
        return stakingStake.rewards[_addr];
    }

    function _totalSupply() public view returns (uint){
        return stakingStake.totalSupply;
    }

    function _balance(address _addr) public view returns(uint) {
        return stakingStake.balanceOf[_addr];
    }
}