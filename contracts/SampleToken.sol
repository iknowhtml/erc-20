pragma solidity ^0.4.19;

import "./Token.sol";
import "./PausableToken.sol";


contract SampleToken is Token, PausableToken {
    /**
    * @dev Constructor function for Sample Token.
    **/
    function SampleToken(string _name, string _symbol, uint8 _decimals, uint256 _supply) public
    Token(_name, _symbol, _decimals, _supply) {
    }
}
