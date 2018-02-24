pragma solidity ^0.4.19;

import "./Token.sol";
import "./Pausible.sol";


contract SampleToken is Token, Pausible {
    string public constant NAME = "Sample Token";
    string public constant SYMBOL = "SAMT";
    uint8 public constant DECIMALS = 18;

    uint public constant TOKEN_SUPPLY = 100;

    function SampleToken() public {
        name = NAME;
        symbol = SYMBOL;
        decimals = DECIMALS;
        //IMPORTANT: Double check this value to ensure that the operations does not overflow!
        totalSupply_ = TOKEN_SUPPLY * (10 ** uint256(decimals));
    }

    /* TODO: override token functions so that they are not callable when contract is paused */
}
