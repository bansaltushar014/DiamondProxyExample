// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct ERC20State {
        uint totalSupply;
        string name ;
        string symbol;
        uint decimals;
        mapping(address => uint) balanceOf;
        mapping(address => mapping(address => uint)) allowance;
        address platformOwner;                                    // This is added when ERC20V2 is being deployed into same struct 
    }



