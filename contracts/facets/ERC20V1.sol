// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ERC20V1 {
     bytes32 constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.diamond.storage");

    struct ERC20State {
        uint totalSupply;
        string name ;
        string symbol;
        uint decimals;
        mapping(address => uint) balanceOf;
        mapping(address => mapping(address => uint)) allowance;
    }

    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);

    constructor() {}

    function diamondStorage() internal pure returns (ERC20State storage ds) {
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function setValue(string memory _name, string memory _symbol, uint _decimals) public {
        ERC20State storage erc20State = diamondStorage();
        erc20State.name = _name;
        erc20State.symbol = _symbol;
        erc20State.decimals = _decimals;
    }

    function __transfer(address _from , address _to, uint _amount ) internal  returns(bool){
        ERC20State storage erc20State = diamondStorage();
        erc20State.balanceOf[_from] -= _amount;
        erc20State.balanceOf[_to] += _amount;
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function transfer(address recipient, uint amount) public returns (bool) {
        return __transfer(msg.sender, recipient, amount);
    }

    function approve(address spender, uint amount) public returns (bool) {
        ERC20State storage erc20State = diamondStorage();
        erc20State.allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint amount ) public returns (bool) {
        ERC20State storage erc20State = diamondStorage();
        erc20State.allowance[sender][msg.sender] -= amount;
        return __transfer(sender, recipient, amount);
    }

    function mint(uint amount) public {
        ERC20State storage erc20State = diamondStorage();
        erc20State.balanceOf[msg.sender] += amount;
        erc20State.totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(uint amount) public {
        ERC20State storage erc20State = diamondStorage();
        erc20State.balanceOf[msg.sender] -= amount;
        erc20State.totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

        function getName() public view returns (string memory) {
         ERC20State storage erc20State = diamondStorage();
        return erc20State.name;
    }

    function getSymbol() public view returns (string memory){
         ERC20State storage erc20State = diamondStorage();
        return erc20State.symbol;
    }

    function getTotalSupply() public view returns (uint){
         ERC20State storage erc20State = diamondStorage();
        return erc20State.totalSupply;
    }

    function getBalance(address _user) public view returns (uint){
         ERC20State storage erc20State = diamondStorage();
        return erc20State.balanceOf[_user];
    }

}
