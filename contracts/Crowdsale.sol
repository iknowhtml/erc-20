pragma solidity ^0.4.19;

import "./Uint256Math.sol";
import "./Ownable.sol";
import "./ERC20.sol";


contract Crowdsale is Ownable {
    using Uint256Math for uint256;

    ERC20 public token;
    uint256 public rate;
    uint256 public weiRaised;
    uint256 public tokensAvailable;

    mapping(address => uint256) public allocations;

    event TokensPurchased(address purchaser, uint256 amount, uint256 allocation);
    event TokensClaimed(address receiver, uint256 amount);
    event FundsWithdrawn(uint256 amount);

    function() external payable {
        _purchaseTokens();
    }

    function Crowdsale(address _tokenAddress, uint256 _rate) public {
        require(_tokenAddress != 0x0);
        require(_rate != 0);

        token = ERC20(_tokenAddress);
        tokensAvailable = token.allowance(owner, address(this));
        rate = _rate;
    }

    function claimTokens(uint256 _amount) external {
        require(_amount <= allocations[msg.sender]);

        allocations[msg.sender] = allocations[msg.sender].subtract(_amount);

        token.transferFrom(address(this), msg.sender, _amount);

        TokensClaimed(msg.sender, _amount);
    }

    function withdrawFunds(uint256 amount) public onlyOwner {
        require(amount <= weiRaised);
        weiRaised = weiRaised.subtract(amount);

        owner.transfer(amount);

        FundsWithdrawn(amount);
    }

    function _purchaseTokens() internal {
        require(msg.value != 0);
        
        uint256 amount = _calculateTokenAmount(msg.value);
        require(amount <= tokensAvailable);

        tokensAvailable = tokensAvailable.subtract(amount);
        allocations[msg.sender] = allocations[msg.sender].add(amount);

        TokensPurchased(msg.sender, amount, allocations[msg.sender]);
    }

    function _preValidatePurchase(address _buyer) internal {

    }

    function _postValidatePurchase(address _buyer) internal {

    }

    function _calculateTokenAmount(uint256 _wei) internal view returns (uint256) {
        return _wei.multiply(rate);
    }
}
