pragma solidity ^0.4.19;

import "./Uint256Math.sol";
import "./SampleToken.sol";


contract Crowdsale is Ownable {
    using Uint256Math for uint256;

    SampleToken public sampleToken;
    uint256 public rate;
    uint256 public weiRaised;

    mapping(address => uint256) public allocations;

    modifier crowdSaleIsGoing() {
        require(block.timestamp >= startTime && block.timestamp < block.timestamp);
        _;
    }

    modifier crowdsaleHasEnded() {
        require(block.timestamp >= endTime);
        _;
    }

    function() external payable {
        purchaseTokens(msg.sender);
    }

    function purchaseTokens(uint256 _address) public;
    function claimTokens() public;

    function _preValidatePurchase(address _buyer) internal;
    function _postValidatePurchase(address _buyer) internal;
    function _calculateTokenAmount(uint256 wei) internal returns (uint256);




}
