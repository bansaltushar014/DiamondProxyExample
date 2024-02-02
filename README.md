# Sample Hardhat Project

This project demonstrates usecase of Diamond Proxy. 

## Branches 
```shell
- master                // Diamond proxy example for ERC20 with diamond storage 
- ERC20withAppStorage   // Diamond proxy example for ERC20 with App storage
- StakingWithAppStorage // Diamond proxy example for Stacking Withdraw and Rewards. 
```

## StakingWithAppStorage 

This is an example for the stacking using the Diamond proxy. Under the contract folder there is `Diamond.sol` , `ERC20Reward.sol` and `ERC20Stake.sol` and rest folders are linked to `Diamond.sol`

`ERC20Reward.sol` , This is a ERC20 smart contract which is being used to provide as rewards token. </br>
`ERC20Stake.sol`, This is a ERC20 smart contract which is being used to stake </br>
`Diamond.sol`, This is the starting point for the proxy contract. Under facets folder contains the logic for stacking. </br>
`facets/AppStorage.sol`, This contains the public varible that are being commonly used by other facets </br>
`facets/Common.sol`, This contains the logic that is commonly used by the facets. This facet is not being deployed </br>
`facets/GetValues.sol`, This contains the logic that fetches the values like totalsupply, stackedAmount etc</br>
`facets/Rewards.sol`, This contains the logic for the Rewards system, Get the rewards, Earned rewards, Notify Deposit </br>
`facets/StakingRewards.sol`, It contains the logic to put tokens on the stake </br>
`facets/WithdrawFunds.sol`, It contains the logic to withdraw the funds </br>
`facets/DiamondCutFacet.sol`, It contains the logic which puts the deployed facets and their selector and map then properly. </br>
`facets/DiamondLoupeFacet.sol`, It does not relate to the logic of stacking, this mainly helps to the developer to get the deployed facets and mapped function selectors to it. </br>
`lib/LibDiamond.sol`, This file contains the logic when DiamondCutFacet is being used then its logic is being used. It used Diamond proxy storage to save the mapping. 

Steps to test the app:

```shell
npx hardhat compile              - to compile 
npx hardhat test  --grep Diamond - to test 
```
