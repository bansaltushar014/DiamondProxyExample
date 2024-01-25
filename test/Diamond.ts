import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { DiamondCutFacet, ERC20V1, ERC20V2 } from "../typechain-types";

describe("Diamond", function () {
	async function deployFacets() {
		const [owner, firstAddress, secondAddress] = await ethers.getSigners();

		const ERC20V1 = await ethers.getContractFactory("ERC20V1");
		const erc20v1 = await ERC20V1.connect(owner).deploy();

		const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
		const diamondCutFacet = await DiamondCutFacet.connect(owner).deploy();
        

		const _diamondCut = [
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0x9e1dde4b"] }, // function signature 'setValue(string memory, string memory, uint)'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0xa9059cbb"] }, // function signature 'transfer(address , uint)'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0x095ea7b3"] }, // function signature 'approve(address, uint)'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0x23b872dd"] }, // function signature 'transferFrom(address, address, uint)'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0xa0712d68"] }, // function signature 'mint(uint)'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0x42966c68"] }, // function signature 'burn(uint)'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0x17d7de7c"] }, // function signature 'getName()'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0x15070401"] }, // function signature 'getSymbol()'
			{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0xc4e41b22"] }, // function signature 'getTotalSupply()'
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
		const diamondV1Proxy = ERC20V1.attach(diamond.target) as ERC20V1;
        const diamondCutFacetProxy = DiamondCutFacet.attach(diamond.target) as DiamondCutFacet;

		return { erc20v1, owner, firstAddress, secondAddress, diamondCutFacet, diamondCutFacetProxy, diamond, diamondV1Proxy };
	}

	describe("Deployment Testing",async function () {
		let erc20v1, owner:any , firstAddress: any, diamond:any, diamondV1Proxy:any;

		before(async function () {
			// Define the variables once before the tests
			({ erc20v1, owner, firstAddress, diamond, diamondV1Proxy } = await loadFixture(
				deployFacets
			));
		});
        it("Set the value", async function () {
			expect(await diamondV1Proxy.connect(owner).setValue("SYL", "SYL", 18)).not.to.be.reverted;
		});
		it("Get the Total Supply as Zero", async function () {
			expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(0);
		});
		it("Mint 10000 tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).mint(10000)).not.to.be.reverted;
			expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(10000);
		});
		it("Transfer tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).transfer(firstAddress.address, 100)).not.to
				.be.reverted;
		});
		it("Balance of tokens ", async function () {
			await expect(await diamondV1Proxy.connect(owner).getBalance(firstAddress.address)).to.be.revertedWithCustomError(diamond, "FunctionNotFound");
		});
	});

    describe("Add Balance Functionality",async function () {
		let erc20v1, owner:any , firstAddress: any, diamondCutFacetProxy:any, diamond:any, diamondV1Proxy:any;

		before(async function () {
			// Define the variables once before the tests
			({ erc20v1, owner, firstAddress, diamond, diamondV1Proxy, diamondCutFacetProxy } = await loadFixture(
				deployFacets
			));
            const __diamondCut = [{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0xf8b2cb4f"] }] // function signature 'getBalance(address)'
            const _init = "0x0000000000000000000000000000000000000000"
            const _calldata = "0x"

            await diamondCutFacetProxy.connect(owner).diamondCut(__diamondCut, _init, _calldata)

		});

		it("Get the Total Supply as Zero", async function () {
			expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(0);
		});
		it("Mint 10000 tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).mint(10000)).not.to.be.reverted;
			expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(10000);
		});
		it("Transfer tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).transfer(firstAddress.address, 100)).not.to
				.be.reverted;
		});
		it("Balance of tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).getBalance(firstAddress.address)).to.equal(100)
		});
	});

    describe("Modify Transfer Functionality",async function () {
		let erc20v1, owner: any , firstAddress: any, secondAddress: any, diamondCutFacetProxy: any, diamond: any, diamondV1Proxy: any;

		before(async function () {
			// Define the variables once before the tests
			({ erc20v1, owner, firstAddress, secondAddress, diamond, diamondV1Proxy, diamondCutFacetProxy } = await loadFixture(
				deployFacets
			));

            const ERC20V2 = await ethers.getContractFactory("ERC20V2");
		    const erc20v2 = await ERC20V2.connect(owner).deploy();
            const diamondV2Proxy = ERC20V2.attach(diamond.target) as ERC20V2;
            
            const __diamondCut = [{ facetAddress: erc20v1.target, action: "0", functionSelectors: ["0xf8b2cb4f"] }, // function signature 'getBalance(address)'
                                  { facetAddress: erc20v2.target, action: "1", functionSelectors: ["0xa9059cbb"] }, // function signature 'transfer(address , uint)'
                                  { facetAddress: erc20v2.target, action: "1", functionSelectors: ["0x23b872dd"] }, // function signature 'transferFrom(address, address, uint)'
                                  { facetAddress: erc20v2.target, action: "0", functionSelectors: ["0x54daabc3"] }] // function signature 'function setPlatformOwner(address _platformOwner) public  '
                                  
            const _init = "0x0000000000000000000000000000000000000000"
            const _calldata = "0x"

            await diamondCutFacetProxy.connect(owner).diamondCut(__diamondCut, _init, _calldata)
            await diamondV2Proxy.connect(owner).setPlatformOwner(secondAddress.address)                     // As setPlatformOwner provided by ERCV2 so it needs to be called by diamondv2 instead diamondv1

		});

		it("Get the Total Supply as Zero", async function () {
			expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(0);
		});
		it("Mint 10000 tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).mint(10000)).not.to.be.reverted;
			expect(await diamondV1Proxy.connect(owner).getTotalSupply()).to.equal(10000);
		});
		it("Transfer tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).transfer(firstAddress.address, 100)).not.to
				.be.reverted;
		});
		it("Balance of tokens ", async function () {
			expect(await diamondV1Proxy.connect(owner).getBalance(firstAddress.address)).to.equal(95)
		});
        it("Balance of secondAddress", async function () {
			expect(await diamondV1Proxy.connect(owner).getBalance(secondAddress.address)).to.equal(5)
		});
	});
});
