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
		console.log(RewardsProxy.interface)

		return { owner, firstAddress, secondAddress, diamondCutFacet, diamondCutFacetProxy, diamond, GetValuesProxy, RewardsProxy,  StakingRewardsProxy, WithdrawFundsProxy, eRC20Reward, eRC20Stake};
	}

	describe("Deployment Testing",async function () {
		let erc20v1, owner:any , firstAddress: any, diamond:any, diamondV1Proxy:any, GetValuesProxy: any, RewardsProxy: any,  StakingRewardsProxy: any, WithdrawFundsProxy: any, eRC20Reward:any, eRC20Stake:any;

		before(async function () {
			// Define the variables once before the tests
			({ owner, firstAddress, diamond, GetValuesProxy, RewardsProxy,  StakingRewardsProxy, WithdrawFundsProxy, eRC20Reward, eRC20Stake } = await loadFixture(
				deployFacets
			));

			eRC20Reward.mint("10000000000000000000000")
			eRC20Reward.transfer(diamond, "10000000000000000000000")
			RewardsProxy.connect(owner).setInitialValue(eRC20Stake.target, eRC20Stake.target)
		});
        it("Check the Balance", async function () {
			expect(await eRC20Reward.connect(owner).balanceOf(diamond)).to.equal("10000000000000000000000");
		});
		it("Set the duration", async function () {
			expect(await RewardsProxy.connect(owner).setRewardsDuration(10000)).not.to.be.reverted;
		});
		it("Set the notifyRewardAmount", async function () {
			expect(await RewardsProxy.connect(owner).notifyRewardAmount("1000000000000000000")).not.to.be.reverted;
		});
		
		// it("Get the Total Supply as Zero", async function () {
		// 	expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(0);
		// });
		// it("Mint 10000 tokens ", async function () {
		// 	expect(await diamondV1Proxy.connect(owner).mint(10000)).not.to.be.reverted;
		// 	expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(10000);
		// });
		// it("Transfer tokens ", async function () {
		// 	expect(await diamondV1Proxy.connect(owner).transfer(firstAddress.address, 100)).not.to
		// 		.be.reverted;
		// });
		// it("Balance of tokens ", async function () {
		// 	await expect(await diamondV1Proxy.connect(owner).getBalance(firstAddress.address)).to.be.revertedWithCustomError(diamond, "FunctionNotFound");
		// });
	});

    // describe("Add Balance Functionality",async function () {
	// 	let erc20v1, owner:any , firstAddress: any, diamondCutFacetProxy:any, diamond:any, diamondV1Proxy:any;

	// 	before(async function () {
	// 		// Define the variables once before the tests
	// 		({ erc20v1, owner, firstAddress, diamond, diamondV1Proxy, diamondCutFacetProxy } = await loadFixture(
	// 			deployFacets
	// 		));
    //         const __diamondCut = [{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0xf8b2cb4f"] }] // function signature 'getBalance(address)'
    //         const _init = "0x0000000000000000000000000000000000000000"
    //         const _calldata = "0x"

    //         await diamondCutFacetProxy.connect(owner).diamondCut(__diamondCut, _init, _calldata)

	// 	});

	// 	it("Get the Total Supply as Zero", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(0);
	// 	});
	// 	it("Mint 10000 tokens ", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).mint(10000)).not.to.be.reverted;
	// 		expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(10000);
	// 	});
	// 	it("Transfer tokens ", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).transfer(firstAddress.address, 100)).not.to
	// 			.be.reverted;
	// 	});
	// 	it("Balance of tokens ", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).getBalance(firstAddress.address)).to.equal(100)
	// 	});
	// });

    // describe("Modify Transfer Functionality",async function () {
	// 	let erc20v1, owner: any , firstAddress: any, secondAddress: any, diamondCutFacetProxy: any, diamond: any, diamondV1Proxy: any;

	// 	before(async function () {
	// 		// Define the variables once before the tests
	// 		({ erc20v1, owner, firstAddress, secondAddress, diamond, diamondV1Proxy, diamondCutFacetProxy } = await loadFixture(
	// 			deployFacets
	// 		));

    //         const ERC20V2 = await ethers.getContractFactory("ERC20V2");
	// 	    const erc20v2 = await ERC20V2.connect(owner).deploy();
    //         const diamondV2Proxy = ERC20V2.attach(diamond.target) as ERC20V2;
            
    //         const __diamondCut = [{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0xf8b2cb4f"] }, // function signature 'getBalance(address)'
    //                               { facetAddress: erc20v2.target, action: "1", functionSelectors: ["0xa9059cbb"] }, // function signature 'transfer(address , uint)'
    //                               { facetAddress: erc20v2.target, action: "1", functionSelectors: ["0x23b872dd"] }, // function signature 'transferFrom(address, address, uint)'
    //                               { facetAddress: erc20v2.target, action: "0", functionSelectors: ["0x54daabc3"] }] // function signature 'function setPlatformOwner(address _platformOwner) public  '
                                  
    //         const _init = "0x0000000000000000000000000000000000000000"
    //         const _calldata = "0x"

    //         await diamondCutFacetProxy.connect(owner).diamondCut(__diamondCut, _init, _calldata)
    //         await diamondV2Proxy.connect(owner).setPlatformOwner(secondAddress.address)                     // As setPlatformOwner provided by ERCV2 so it needs to be called by diamondv2 instead diamondv1

	// 	});

	// 	it("Get the Total Supply as Zero", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(0);
	// 	});
	// 	it("Mint 10000 tokens ", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).mint(10000)).not.to.be.reverted;
	// 		expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(10000);
	// 	});
	// 	it("Transfer tokens ", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).transfer(firstAddress.address, 100)).not.to
	// 			.be.reverted;
	// 	});
	// 	it("Balance of tokens ", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).getBalance(firstAddress.address)).to.equal(95)
	// 	});
    //     it("Balance of secondAddress", async function () {
	// 		expect(await diamondV1Proxy.connect(owner).getBalance(secondAddress.address)).to.equal(5)
	// 	});
	// });
});
