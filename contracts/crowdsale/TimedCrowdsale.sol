pragma solidity ^0.4.19;

import "./Crowdsale.sol";


contract TimedCrowdsale is Crowdsale {
    uint256 public startTime;
    uint256 public endTime;

    function TimedCrowdsale(uint256 _startTime, uint256 _endTime) public {
        startTime = _startTime;
        endTime = _endTime;
    }

    modifier crowdSaleIsOngoing() {
        require(block.timestamp >= startTime && block.timestamp < block.timestamp);
        _;
    }

    modifier crowdsaleHasEnded() {
        require(block.timestamp >= endTime);
        _;
    }
}
