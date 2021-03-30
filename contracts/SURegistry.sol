pragma solidity ^0.5.16;

contract SURegistry {

    struct public StorageUnit
    {
        bytes name;
        bytes32 owner;
    };

    StorageUnit[] public registry;

    event Registered(StorageUnit hashes);
    
    function register(bytes _name, bytes32 _owner) public {
        StorageUnit hashes = StorageUnit(_name, _owner);
        registry.push(hashes);
        emit Registered(hashes);
    } 
    
    function verify(bytes _name, bytes32 _owner) public view returns (boolean) {
        return documents[hash];
    }
}