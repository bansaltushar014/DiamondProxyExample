import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DiamondCutFacet, GetValues, Rewards, StakingRewards, WithdrawFunds  } from "../typechain-types";

describe("Diamond", function () {
	async function deployFacets() {
		const [owner, firstAddress, secondAddress] = await ethers.getSigners();

		const ERC20Reward = await ethers.getContractFactory("ERC20Reward");
		const eRC20Reward = await ERC20Reward.connect(owner).deploy();	
		
		const ERC20Stake = await ethers.getContractFactory("ERC20Stake");
		const eRC20Stake = await ERC20Stake.connect(owner).deploy();	

		const GetValues = await ethers.getContractFactory("GetValues");
		const getValues = await GetValues.connect(owner).deploy();	

		const Rewards = await ethers.getContractFactory("Rewards");
		const rewards = await Rewards.connect(owner).deploy();

		const StakingRewards = await ethers.getContractFactory("StakingRewards");
		const stakingRewards = await StakingRewards.connect(owner).deploy();

		const WithdrawFunds = await ethers.getContractFactory("WithdrawFunds");
		const withdrawFunds = await WithdrawFunds.connect(owner).deploy();		

		const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
		const diamondCutFacet = await DiamondCutFacet.connect(owner).deploy();
        
		const _diamondCut = [
			{ facetAddress: stakingRewards.target, action: "0", functionSelectors: ["0xa694fc3a"] }, // function signature 'stake(uint _amount) external updateReward(msg.sender)'
			{ facetAddress: withdrawFunds.target, action: "0", functionSelectors: ["0x2e1a7d4d"] }, // function signature 'withdraw(uint _amount) external updateReward(msg.sender)'
			{ facetAddress: rewards.target, action: "0", functionSelectors: ["0xfb8e5b87"] }, // function signature 'setInitialValue(address _stakingToken, address _rewardToken) public'
			{ facetAddress: rewards.target, action: "0", functionSelectors: ["0xcc1a378f"] }, // function signature 'setRewardsDuration(uint _duration) external onlyOwner'
			{ facetAddress: rewards.target, action: "0", functionSelectors: ["0x3c6b16ab"] }, // function signature 'notifyRewardAmount(	uint _amount)'
			{ facetAddress: rewards.target, action: "0", functionSelectors: ["0x008cc262"] }, // function signature 'earned(address _account) '
			{ facetAddress: rewards.target, action: "0", functionSelectors: ["0x3d18b912"] }, // function signature 'getReward()'
			{ facetAddress: rewards.target, action: "0", functionSelectors: ["0xcd3daf9d"] }, // function signature 'rewardPerToken() internal view returns (uint)'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0x245c7c60"] }, // function signature '_duration()'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0xe4785fa9"] }, // function signature '_finishAt()'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0x3a1281cb"] }, // function signature '_updatedAt()'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0x68fd25cd"] }, // function signature '_rewardRate()'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0x31bed160"] }, // function signature '_rewardTokenStored()'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0xf1860f50"] }, // function signature '_userRewardPerTokenPain(address)'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0x7d6dfb7e"] }, // function signature '_rewards(address)'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0x3eaaf86b"] }, // function signature '_totalSupply()'
			{ facetAddress: getValues.target, action: "0", functionSelectors: ["0xd3aceae2"] }, // function signature '_balance(address)'
			{
				facetAddress: diamondCutFacet.target,
				action: "0",
				functionSelectors: ["0x1f931c1c"],
			}, // function signature 'diamondCut((address,uint8,bytes4[])[],address,bytes)'
		];

		const _args = {
			owner: owner.address,
			init: "0x0000000000000000000000000000000000000000",
			initCalldata: "0x",
		};

		const Diamond = await ethers.getContractFactory("Diamond");
		const diamond = await Diamond.connect(owner).deploy(_diamondCut, _args);
		const GetValuesProxy = GetValues.attach(diamond.target) as GetValues;
		const RewardsProxy = Rewards.attach(diamond.target) as Rewards;
		const StakingRewardsProxy = StakingRewards.attach(diamond.target) as StakingRewards;
		const WithdrawFundsProxy = WithdrawFunds.attach(diamond.target) as WithdrawFunds;
        const diamondCutFacetProxy = DiamondCutFacet.attach(diamond.target) as DiamondCutFacet;

		return { owner, firstAddress, secondAddress, diamondCutFacet, diamondCutFacetProxy, diamond, GetValuesProxy, RewardsProxy,  StakingRewardsProxy, WithdrawFundsProxy, eRC20Reward, eRC20Stake};
	}

	describe("Deployment Testing",async function () {
		let erc20v1, owner:any , firstAddress: any, diamond:any, diamondV1Proxy:any, GetValuesProxy: any, RewardsProxy: any,  StakingRewardsProxy: any, WithdrawFundsProxy: any, eRC20Reward:any, eRC20Stake:any;

		before(async function () {
			// Define the variables once before the tests
			({ owner, firstAddress, diamond, GetValuesProxy, RewardsProxy,  StakingRewardsProxy, WithdrawFundsProxy, eRC20Reward, eRC20Stake } = await loadFixture(
				deployFacets
			));

			eRC20Reward.mint("100000000000000000000")
			eRC20Reward.transfer(diamond.target, "100000000000000000000")
			RewardsProxy.connect(owner).setInitialValue(eRC20Stake.target, eRC20Reward.target)
		});
        it("Check the Balance", async function () {
			expect(await eRC20Reward.connect(owner).balanceOf(diamond.target)).to.equal("100000000000000000000");
		});
		it("Set the duration", async function () {
			expect(await RewardsProxy.connect(owner).setRewardsDuration(1000)).not.to.be.reverted;
		});
		it("Set the notifyRewardAmount", async function () {
			expect(await RewardsProxy.connect(owner).notifyRewardAmount("1000000000000000000")).not.to.be.reverted;
		});
		it("Mint token and put them on stake", async function() {
			expect(await eRC20Stake.connect(firstAddress).mint("1000000000000000000")).not.to.be.reverted;
			expect(await eRC20Stake.connect(firstAddress).approve(diamond.target, "1000000000000000000")).not.to.be.reverted;
			expect(await StakingRewardsProxy.connect(firstAddress).stake("1000000000000000000")).not.to.be.reverted;
			expect(await eRC20Stake.connect(firstAddress).balanceOf(firstAddress)).to.equal("0") 				// As stacked everything , so balance 0
			expect(await GetValuesProxy.connect(owner)._totalSupply()).to.equal("1000000000000000000")
		})
		it("How much earned!", async function() {
			await time.increase(10);		// Waiting for 10 seconds 
			expect(await RewardsProxy.connect(firstAddress).earned(firstAddress)).to.equal("10000000000000000")  // per second reward 1*10**15 , after 10 sec it will be 1*10**16 
		})
		it("Get collected Reward - First!", async function() {
			expect(await RewardsProxy.connect(firstAddress).getReward()).not.to.be.reverted;
			expect(await eRC20Reward.connect(firstAddress).balanceOf(firstAddress)).to.equal("11000000000000000") // After the last test , reward gets increase by 1*10**15 
		})
		it("Still earning Reward, Stop it!", async function() {
			await time.increase(10);		// Waiting for 10 seconds 
			expect(await RewardsProxy.connect(firstAddress).earned(firstAddress)).to.equal("10000000000000000")  // per second reward 1*10**15 , after 10 sec it will be 1*10**16 
			expect(await WithdrawFundsProxy.connect(firstAddress).withdraw("1000000000000000000")).not.to.be.reverted;
			expect(await GetValuesProxy.connect(owner)._totalSupply()).to.equal("0")
			expect(await RewardsProxy.connect(firstAddress).earned(firstAddress)).to.equal("11000000000000000")  // After the last test , reward gets increase by 1*10**15 
			await time.increase(10);		// Waiting for 10 seconds 
			expect(await RewardsProxy.connect(firstAddress).earned(firstAddress)).to.equal("11000000000000000")  // Even after 10 sec now the earned value will remain as all the stacked amount withdrawn 
		})
		it("Get remaining collected Reward - Last!", async function() {
			expect(await RewardsProxy.connect(firstAddress).getReward()).not.to.be.reverted;
			expect(await eRC20Reward.connect(firstAddress).balanceOf(firstAddress)).to.equal("22000000000000000") // First getRewards 11000000000000000 + Last getRewards 11000000000000000
		})
		it("Validate the withdrawl token and Earned reward", async function() {
			expect(await eRC20Stake.connect(firstAddress).balanceOf(firstAddress)).to.equal("1000000000000000000") // Stacked Amount
			expect(await eRC20Reward.connect(firstAddress).balanceOf(firstAddress)).to.equal("22000000000000000")  // Earned reward
		})
	});

});
