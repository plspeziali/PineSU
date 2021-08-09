# PineSU
NodeJS application which provides file version control along with integrity checking on the Ethereum blockchain network

**This application is still not ready to be used! Try it at your own risk!**

This application is part of my deegree thesis @ UniPG.

# What it does now

<img src="favicon.png" alt="drawing" align="right" height="150x"/>
By calling and executing with node the file `index.js` in a folder with the files you want to work with, PineSU will create a new file .pinesu.json along with a .git folder.
After that the program will ask you if you have to ignore some files and get you through the process of selecting the files which will populate the .gitignore file.
Finally the program will save in .pinesu.json the information about the Storage Unit (PineSU directory) you just created and a list of the files and the directories in this format: `filename:filehash`. It can then register the has opf the single Storge Unit in the Ethereum Blockchain and verify the files.


## TODO List

 - [ ] Improve the creation of local Merkle Trees for hashing a single Storage Unit
 - [x] Improve local saving of Merkle Calendars
 - [x] Implement sub-SUs exporting with blockchain checking
 - [ ] Improve Git implementation
 - [ ] Improve checking of past versions
 - [ ] Implement server-side storage (with Git Servers?)