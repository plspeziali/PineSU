var crypto = require('crypto');
const fs = require('fs');

function fromArray(array, hashalgo, hashlist){
    var levels = Array();
    if(!hashlist){
        array = hashElements(array, hashalgo);
    }
    levels.push(array.slice());
    var j=0;
    while(levels[levels.length - 1].length != 1){
        var level = Array();
        for(let i = 0; i<levels[j].length; i+=2){
            if(i != levels[j].length-1){
                level.push(hashElement(levels[j][i]+''+levels[j][i+1],hashalgo));
            } else {
                level.push(hashElement(levels[j][i],hashalgo));
            }
        }
        levels.push(level.slice());
        //console.log("level num. "+j+": "+levels[j])
        j++;
    }
    return levels.reverse().slice();
}

function hashElements(array, hashalgo){
    var result = Array();
    for(var el in array){
        result.push(hashElement(el,hashalgo));
    }
    return result;
}

function hashElement(el, hashalgo){
    return crypto.createHash(hashalgo).update(el).digest('hex');
}

// Calcola l'hash di un file
function fileHashSync(filePath){
    var fileData;
 
 
    try{ fileData = fs.readFileSync(filePath, 'utf8'); }
 
    catch(err){
        if(err.code === 'ENOENT') return console.error('File '+filePath+' does not exist. Error: ', err);
 
        return console.error('Error: ', err);
    }
 
    return ''+crypto.createHash('sha1').update(fileData, 'utf8').digest('hex');
 }

module.exports = {
    fromArray: fromArray,
    fileHashSync: fileHashSync
  }