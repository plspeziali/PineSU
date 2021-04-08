pragma solidity ^0.5.16;

contract SURegistry {

    string StorageUnit;

    mapping(uint => string) public registry;

    uint public SUCount;

    function addSU(string memory hashSU) public {

        SUCount++;

        registry[SUCount] = hashSU;

    }

}