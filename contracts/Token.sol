pragma solidity ^0.4.19;

import "./ERC20.sol";
import "./Uint256Math.sol";


contract Token is ERC20 {
    using Uint256Math for uint256;

    uint256 public totalSupply_;
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    /**
    * @return The total supply of tokens
    **/
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
    * @param _owner The address from which the balance will be retrieved
    * @return The balance of the given address
    **/
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    /**
    * @dev Transfers a certain amount of tokens to an address
    * @param _to The address of the recipient
    * @param _value The amount of token to be transferred
    * @return Whether the transfer was successful or not
    **/
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // checks that to address isn't the 0x0 address (contract creation address)
        require(_to != 0x0);
        // checks that the from address contains enough tokens
        require(balances[msg.sender] >= _value);

        balances[msg.sender] = balances[msg.sender].subtract(_value);
        balances[_to] = balances[_to].add(_value);

        Transfer(msg.sender, _to, _value);

        return true;
    }

    /**
    * @dev Transfers a certain amount of tokens from a given address to another address
    * (as long as the transfer has been approved by the from address)
    * @param _from The address of the sender
    * @param _to The address of the recipient
    * @param _value The amount of token to be transferred
    * @return Whether the transfer was successful or not
    **/
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // checks that approved address isn't the 0x0 address (contract creation address)
        require(_to != 0x0);
        // checks that the transfer value is not greater than the allowances value
        require(allowances[_from][_to] >= _value);
        // checks that balance in the from address is greater than the transfer value
        require(balances[_from] >= _value);

        balances[_from] = balances[_from].subtract(_value);
        balances[_to] = balances[_to].add(_value);

        // updates allowances
        allowances[_from][_to] = allowances[_from][_to].subtract(_value);

        Transfer(_from, _to, _value);

        return true;
    }

    /**
    * @dev Approves (but does not send) the transfer of tokens from an address
    * @dev also, be aware of this attack vector:
    * https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit#heading=h.gmr6zdg47087
    * @param _spender The address of the account able to transfer the tokens
    * @param _value The amount of tokens to be approved for transfer
    * @return Whether the approval was successful or not
    **/
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowances[msg.sender][_spender] = _value;

        Approval(msg.sender, _spender, _value);

        return true;
    }

    /*
    * @dev Returns the amount of tokens an address can spend from the owner's balance.
    * @param _owner The address of the account owning tokens
    * @param _spender The address of the account able to transfer the tokens
    * @return Amount of remaining tokens allowed to spent
    **/
    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowances[_owner][_spender];
    }
}
