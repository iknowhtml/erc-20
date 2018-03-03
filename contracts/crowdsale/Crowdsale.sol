pragma solidity ^0.4.19;

import "../utilities/Uint256Math.sol";
import "../utilities/Ownable.sol";
import "../token/ERC20.sol";


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

    /**
    * @dev Contructor function for Crowdsale
    * @param _tokenAddress Contract address for a ERC-20 token.
    * @param _rate Rate for how many tokens are allocated per ETH.
    * NOTE: Be aware that totalSupply is your intended supply multiplied by 10 to the number of decimal places desired.
    **/
    function Crowdsale(address _tokenAddress, uint256 _rate, uint256 _tokensAvailable) public {
        require(_tokenAddress != 0x0);
        require(_rate != 0);

        token = ERC20(_tokenAddress);
        rate = _rate;

        uint256 totalSupply = token.totalSupply();

        require(_tokensAvailable <= totalSupply);

        tokensAvailable = _tokensAvailable;
    }

    /**
    * @dev Fallback function.
    * Function called when a contributor wants to allocate tokens to themself by sending ETH to this contracts address.
    **/
    function() external payable {
        _purchaseTokens();
    }

    /**
    * @dev Claims and transfers tokens into user's wallet.
    * @param _amount Amount of tokens the user wishes to claim.
    * (amount must be less than what the user has purchased)
    **/
    function claimTokens(uint256 _amount) external {
        require(_amount <= allocations[msg.sender]);
        require(_amount <= token.allowance(owner, address(this)));

        allocations[msg.sender] = allocations[msg.sender].subtract(_amount);

        token.transfer(msg.sender, _amount);

        TokensClaimed(msg.sender, _amount);
    }

    /**
    * @dev Transfers ETH from this contract balance to the owners address.
    * @param _amount Amount of ETH (in wei) the user wishes to withdraw.
    **/
    function withdrawFunds(uint256 _amount) public onlyOwner {
        require(_amount <= weiRaised);
        weiRaised = weiRaised.subtract(_amount);

        owner.transfer(_amount);

        FundsWithdrawn(_amount);
    }

    /**
    * @dev Internal function to be called when a contributor wishes to purchase tokens.
    **/
    function _purchaseTokens() internal {
        uint256 amount = _calculateTokenAmount(msg.value);

        _preValidatePurchase(amount);

        tokensAvailable = tokensAvailable.subtract(amount);
        weiRaised = weiRaised.add(msg.value);

        allocations[msg.sender] = allocations[msg.sender].add(amount);

        _postValidatePurchase(amount);

        TokensPurchased(msg.sender, amount, allocations[msg.sender]);
    }

    /**
    * @dev Validation function called before purchase.

    * Extend function in more complex use cases by calling super inside overwritten function.
    * @param _tokenAmount amount of tokens a contributor is purchasing.
    **/
    function _preValidatePurchase(uint256 _tokenAmount) internal view {
        require(msg.value != 0);
        require(_tokenAmount <= tokensAvailable);
    }

    /**
    * @dev Validation function called after purchase.
    * Extend function in more complex use cases by overriding function and calling super.
    * @param _tokenAmount amount of tokens a contributor is purchasing.
    **/
    function _postValidatePurchase(uint256 _tokenAmount) internal pure {

    }

    /**
    * @dev Calculates the amount of tokens based on the amount of wei sent and the rate.
    * @param _wei Amount of wei user contributes to crowdsale.
    **/
    function _calculateTokenAmount(uint256 _wei) internal view returns (uint256) {
        return _wei.multiply(rate);
    }
}
