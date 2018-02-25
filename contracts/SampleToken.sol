pragma solidity ^0.4.19;

import "./Token.sol";
import "./Pausible.sol";


contract SampleToken is Token, Pausible {

    // Parameters for determining characteristics of the token
    string public constant NAME = "Sample Token";
    string public constant SYMBOL = "SAMT";
    uint8 public constant DECIMALS = 18;
    uint public constant TOKEN_SUPPLY = 100;

    /**
    * @dev Contructor function for Sample Token.
    **/
    function SampleToken() public {
        name = NAME;
        symbol = SYMBOL;
        decimals = DECIMALS;
        //IMPORTANT: Double check this value to ensure that the operations does not overflow!
        totalSupply_ = TOKEN_SUPPLY * (10 ** uint256(decimals));
    }

    /**
    * @dev Transfers a certain amount of tokens to an address when the contract is not paused.
    * @param _to The address of the recipient.
    * @param _value The amount of token to be transferred.
    * @return Whether the transfer was successful or not.
    **/
    function transfer(address _to, uint256 _value) public whenNotPaused returns (bool success) {
        return super.transfer(_to, _value);
    }

    /**
    * @dev Transfers a certain amount of tokens from a given address to another address when the contract is not paused.
    * (as long as the transfer has been approved by the from address)
    * @param _from The address of the sender.
    * @param _to The address of the recipient.
    * @param _value The amount of token to be transferred.
    * @return Whether the transfer was successful or not.
    **/
    function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns (bool success) {
        return super.transferFrom(_from, _to, _value);
    }

    /**
    * @dev Approves (but does not send) the transfer of tokens from an address when contract is not paused.
    * @param _spender The address of the account able to transfer the tokens.
    * @param _value The amount of tokens to be approved for transfer.
    * @return Whether the approval was successful or not.
    **/
    function approve(address _spender, uint256 _value) public returns (bool success) {
        return super.approve(_spender, _value);
    }
}
