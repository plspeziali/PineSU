# PineSU
NodeJS application which provides file version control along with integrity checking on the Ethereum blockchain network

**This application is still not ready to be used! Try it at your own risk!**

This application is part of my internship @ UniPG.

# What it does now

<img src="favicon.png" alt="drawing" align="right" height="150x"/>
By calling and executing with node the file `index.js` in a folder with the files you want to work with, PineSU will create a new file .pinesu.json along with a .git folder.
After that the program will ask you if you have to ignore some files and get ypu through the process of selecting the files which will populate the .gitignore file.
Finally the program will save in .pinesu.json the information about the Storage Unit (PineSU directory) you just created and a JSON file contaning the structure of the file tree, where every file and folder is represented with `filename:filehash`.
It can also manage to export files along with proofs in order to verify them on a Merkle Tree.


## TODO List

 - [x] Implement Merkle Tree hashing
 - [x] Implement Git client operations
 - [x] Implement efficient hashes storage
 - [x] Implement client-side integrity checking with the Ethereum blockchain
 - [ ] Implement client-side integrity checking given the file and the hash of its peer files and directory
 - [ ] Implement client-side GUI
 - [x] Implement client-side CLI
 - [x] Improve the application pattern division
 - [ ] Implement user authentication with scheduled Storage Unit upload and checking