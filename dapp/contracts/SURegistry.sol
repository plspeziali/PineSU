pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract SURegistry {

    string StorageUnit;

    mapping(uint => StorageUnit) public registry;

    uint public SUCount;

    function addSU(string memory hashSU) public {

        SUCount++;

        registry[SUCount] = hashSU;

    }

}