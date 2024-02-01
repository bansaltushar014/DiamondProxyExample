// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20State} from "./AppStorage.sol";

contract ERC20V1 {
    ERC20State erc20State;
    
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);

    constructor() {}

    function setValue(string memory _name, string memory _symbol, uint _decimals) public {
        erc20State.name = _name;
        erc20State.symbol = _symbol;
        erc20State.decimals = _decimals;
    }

    function __transfer(address _from , address _to, uint _amount ) internal  returns(bool){
        erc20State.balanceOf[_from] -= _amount;
        erc20State.balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function transfer(address recipient, uint amount) public returns (bool) {
        return __transfer(msg.sender, recipient, amount);
    }

    function approve(address spender, uint amount) public returns (bool) {
        erc20State.allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint amount ) public returns (bool) {
        erc20State.allowance[sender][msg.sender] -= amount;
        return __transfer(sender, recipient, amount);
    }

    function mint(uint amount) public {
        erc20State.balanceOf[msg.sender] += amount;
        erc20State.totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) public {
        erc20State.balanceOf[msg.sender] -= amount;
        erc20State.totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    function getName() public view returns (string memory) {
        return erc20State.name;
    }

    function getSymbol() public view returns (string memory){
        return erc20State.symbol;
    }

    function getTotalSupply() public view returns (uint){
        return erc20State.totalSupply;
    }

    function getBalance(address _user) public view returns (uint){
        return erc20State.balanceOf[_user];
    }

}
