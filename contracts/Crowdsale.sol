pragma solidity ^0.4.19;

import "./Uint256Math.sol";
import "./SampleToken.sol";


contract Crowdsale is Ownable {
    using Uint256Math for uint256;

    SampleToken public sampleToken;
    uint256 public rate;
    uint256 public weiRaised;

    function() external payable {
        purchaseTokens();
    }

    function claimTokens() external {

    }

    function withdrawlFunds() external {
        owner.transfer(msg.value);
    }

    function purchaseTokens() internal {

    }

    function _preValidatePurchase(address _buyer) internal {

    }

    function _postValidatePurchase(address _buyer) internal {

    }

    function _calculateTokenAmount(uint256 _wei) internal view returns (uint256) {
        return _wei.multiply(rate);
    }
}
