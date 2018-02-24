pragma solidity ^0.4.19;


contract Ownable {
    address public owner;

    /**
    * @dev Constructor for Ownable contract. Sets contract owner to address that deployed the contract.
    **/
    function Ownable() public {
        owner = msg.sender;
    }

    /*
    * @dev Modifier to ensure that function is being executed by only the owner of the contract.
    */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address _newOwner) public onlyOwner {
        // check to insure that the new owner's address is not 0x0.
        // otherwise, the contract will permanently be unusable.
        require(_newOwner != 0x0);

        owner = _newOwner;
    }
}
