pragma solidity ^0.4.19;

import "./ERC20.sol";
import "../utilities/Uint256Math.sol";


contract Token is ERC20 {
    using Uint256Math for uint256;

    /*
    * @dev The name, symbol and decimals state variables are all OPTIONAL parameters for a token.
    * name: Name of the token.
    * symbol: Three or four letter symbol for token.
    * decimal: Degree of precision you want to be able to subdivide tokens.
    * i.e., 2 decimal places means you can own X.YZ amount of a token.
    */
    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 public totalSupply_;
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
    * @dev Constructor for Token smart contract
    * @param _name Name of the token.
    * @param _symbol Symbol for the token.
    * @param _decimals Decimal places for token
    * (Note: ensure value does not exceed 255)
    * @param _supply Intended supply of the token.
    * (Note: total supply will equal the intended supply (_supply) times the 10^decimals value (_decimal))
     **/
    function Token(string _name, string _symbol, uint8 _decimals, uint256 _supply) public {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        //IMPORTANT: Double check this value to ensure that the operations does not overflow
        totalSupply_ = _supply * (10 ** uint256(decimals));
        balances[msg.sender] = totalSupply_;
    }

    /**
    * @return The total supply of tokens.
    **/
    function totalSupply() public view returns (uint256) {
        return totalSupply_;
    }

    /**
    * @param _owner The address from which the balance will be retrieved
    * @return The balance of the given address.
    **/
    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    /**
    * @dev Transfers a certain amount of tokens to an address.
    * @param _to The address of the recipient.
    * @param _value The amount of token to be transferred.
    * @return success Whether the transfer was successful or not.
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
    * @dev Transfers a certain amount of tokens from a given address to another address.
    * (as long as the transfer has been approved by the from address)
    * @param _from The address of the sender.
    * @param _to The address of the recipient.
    * @param _value The amount of token to be transferred.
    * @return success Whether the transfer was successful or not.
    **/
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        // checks that approved address isn't the 0x0 address (contract creation address)
        require(_to != 0x0);
        // checks that the transfer value is not greater than the allowances value
        require(allowances[_from][_to] >= _value);
        // checks that balance in the from address is greater than the transfer value
        require(balances[_from] >= _value);

        // updates allowances
        allowances[_from][_to] = allowances[_from][_to].subtract(_value);

        balances[_from] = balances[_from].subtract(_value);
        balances[_to] = balances[_to].add(_value);

        Transfer(_from, _to, _value);

        return true;
    }

    /**
    * @dev Approves (but does not send) the transfer of tokens from an address.
    * @dev also, be aware of this attack vector:
    * https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/edit#heading=h.gmr6zdg47087
    * @param _spender The address of the account able to transfer the tokens.
    * @param _value The amount of tokens to be approved for transfer.
    * @return success Whether the approval was successful or not.
    **/
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowances[msg.sender][_spender] = _value;

        Approval(msg.sender, _spender, _value);

        return true;
    }

    /*
    * @dev Returns the amount of tokens an address can spend from the owner's balance.
    * @param _owner The address of the account owning tokens.
    * @param _spender The address of the account able to transfer the tokens.
    * @return remaining Amount of remaining tokens allowed to spent.
    **/
    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowances[_owner][_spender];
    }
}
