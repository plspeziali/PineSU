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
        // We know the length of the array
        uint memory arrayLength = registry.length;
        uint8 memory result = 0; // 0: nothing found; 1: found name, not name with that owner; 2: all found
        
        for (uint memory i=0; i<arrayLength; i++) {
            if(registry[i].name == _name){
                if(registry[i].owner == _owner){
                    return 2;
                }
                result = 1;
            }
        }

        return result;
    }
}