pragma solidity ^0.4.19;

import "./Ownable.sol";


contract Pausable is Ownable {
    //defaults to false
    bool public paused;

    event Paused();
    event Unpaused();

    /**
    * @dev Modifier to ensure a function is called when only when the contract isn't paused.
    **/
    modifier whenNotPaused() {
        require(paused == false);
        _;
    }

    /**
    * @dev Modifier to ensure a function is called when only when the contract is paused.
    **/
    modifier whenPaused() {
        require(paused == true);
        _;
    }

    /**
    * @dev Function to pause the contract. Can only be called by the contract owner when the contract is not paused.
    **/
    function pause() public onlyOwner whenNotPaused {
        paused = true;
        Paused();
    }

    /**
    * @dev Function to unpause the contract. Can only be called by the owner when the contract is paused.
    **/
    function unpause() public onlyOwner whenPaused {
        paused = false;
        Unpaused();
    }
}
