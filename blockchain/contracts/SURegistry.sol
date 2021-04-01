pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

contract SURegistry {

    struct StorageUnit
    {
        bytes name;
        bytes32 owner;
    }

    StorageUnit[] public registry;

    event Registered(StorageUnit hashes);
    
    function register(bytes memory _name, bytes32 _owner) public {
        StorageUnit memory hashes = StorageUnit(_name, _owner);
        registry.push(hashes);
        emit Registered(hashes);
    } 
    
    function verify(bytes memory _name, bytes32 _owner) public view returns (uint res) {
        // We know the length of the array
        uint arrayLength = registry.length;
        uint8 result = 0; // 0: nothing found; 1: found name, not name with that owner; 2: all found
        
        for (uint i=0; i<arrayLength; i++) {
            if(keccak256(abi.encodePacked(registry[i].name)) == keccak256(abi.encodePacked(_name))){
                if(keccak256(abi.encodePacked(registry[i].owner)) == keccak256(abi.encodePacked(_owner))){
                    return 2;
                }
                result = 1;
            }
        }

        return result;
    }
}