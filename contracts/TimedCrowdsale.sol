pragma solidity ^0.4.19;


contract TimedCrowdsale {
    uint256 public startTime;
    uint256 public endTime;

    function TimedCrowdsale(uint256 _startTime, uint256 _endTime) {
        startTime = _startTime;
        endTime = _endTime;
    }

    modifier crowdSaleIsGoing() {
        require(block.timestamp >= startTime && block.timestamp < block.timestamp);
        _;
    }

    modifier crowdsaleHasEnded() {
        require(block.timestamp >= endTime);
        _;
    }
}
