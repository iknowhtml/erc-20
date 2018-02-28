pragma solidity ^0.4.19;

import "./Uint256Math.sol";
import "./Ownable.sol";
import "./ERC20.sol";


contract Crowdsale is Ownable {
    using Uint256Math for uint256;

    ERC20 public token;
    address public tokenAddress;
    uint256 public rate;
    uint256 public weiRaised;

    event FundsWithdrawn(uint256 amount);

    function() external payable {
        _purchaseTokens();
    }

    function Crowdsale(address _tokenAddress, uint256 _rate) public {
        require(_tokenAddress != 0x0);
        require(_rate != 0);

        tokenAddress = _tokenAddress;
        rate = _rate;
    }

    function claimTokens() external {

    }

    function withdrawFunds(uint256 amount) public onlyOwner {
        require(amount <= weiRaised);
        weiRaised = weiRaised.subtract(amount);

        owner.transfer(amount);

        FundsWithdrawn(amount);
    }

    function _purchaseTokens() internal {

    }

    function _preValidatePurchase(address _buyer) internal {

    }

    function _postValidatePurchase(address _buyer) internal {

    }

    function _calculateTokenAmount(uint256 _wei) internal view returns (uint256) {
        return _wei.multiply(rate);
    }
}
