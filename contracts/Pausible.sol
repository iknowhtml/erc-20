pragma solidity ^0.4.19;


contract Pausible is Ownable {
    //defaults to false
    bool public paused;

    /**
    * @dev Modifier to ensure a function is called when only when the contract isn't paused.
    **/
    modifier whenNotPaused() {
        require(paused == false);
        _;
    }

    /**
    * @dev Function to pause the contract. Can only be called by the contract owner.
    **/
    function pause() public onlyOwner {
        paused = true;
    }

    /**
    * @dev Function to unpause the contract. Can only be called by the owner.
    **/
    function unpaused() public onlyOwner {
        paused = false;
    }
}
