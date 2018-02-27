pragma solidity ^0.4.19;

/**
 * @dev Math operations with checks to prevent overflows (based on OpenZepplin implementation)
 */

library Uint256Math {
    /**
    * param a Value to be add to.
    * param b Value to add.
    * return Result of adding a and b.
    * @dev Adds two numbers, throws if value overflows.
    **/
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;

        // check to insure that the result did not overflow.
        assert(c >= a);

        return c;
    }

    /**
    * @dev Substracts two numbers, throws if value overflows.
    * param a Value to be subtracted.
    * param b Value to subtract.
    * return Result of subtracting b from a.
    **/
    function subtract(uint256 a, uint256 b) internal pure returns (uint256) {
        // check to insure that the result is not negative (would wrap and overflow)
        assert(b <= a);

        return a - b;
    }

    /**
    * @dev Multiplies two numbers, throws if value overflows.
    * param a Value to multiply.
    * param b Value to be multiplied.
    * return Result of multiplying a by b.
    **/
    function multiply(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a * b;
        
        // check to insure that the result did not overflow.
        assert(c / b == a);

        return c;
    }
}
