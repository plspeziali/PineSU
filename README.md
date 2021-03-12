# PineSU
NodeJS application which provides file version control along with integrity checking on the Ethereum blockchain network

# What it does now
By calling and executing with node the file `index.js` in a folder with the files you want to work with, PineSU will create a new hidden folder .pinesu along with a .git folder.
After that the program will ask you if you have to ignore some files and get ypu through the process of selecting the files which will populate the .gitignore file.
Finally the program will save in .pinesu the information about the Storage Unit (PineSU directory) you just created and a JSON file contaning the structure of the file tree, where every file and folder is represented with `filename:h:filehash`.

## TODO List

 - [ ] Implement GitHub authentication for pushing
 - [x] Implement Merkle Tree hashing
 - [x] Implement Git client operations
 - [ ] Implement efficient hashes storage
 - [ ] Implement server-side upload
 - [ ] Implement client -side integrity checking with the Ethereum blockchain
 - [ ] Implement client-side integrity checking given the file and the hash of its peer files and directory
 - [ ] Implement client-side GUI
 - [x] Implement client-side CLI
 - [ ] Improve the application pattern division
 - [ ] Implement user authentication with scheduled Storage Unit upload and checking