var merkle = require(__dirname+'\\lib\\merkle.js');

class TreeList{
    // Data una lista di file, ne crea un albero
    createTree(list){
        result = {};
        list.forEach(p => p.split('/').reduce((o, k) => o[k] = o[k] || {}, result));
        saveJSON(result);
    }

    createHashLists(list){
        // Creo una lista notHashedList in cui sono presenti, per ora, tutte le directory
        var notHashedList=createDirectoryList(list);
        var hashedList=createHashedList(list);
        // vado a calcolare l'hash delle directory tramite il metodo introdotto dai Merkle Trees e le rimuovo gradualmente
        // da notHashedList per metterle in hashedList
        var i = 0;
        while(typeof notHashedList !== 'undefined' && notHashedList.length > 0){
        // Se una directory è presente solo una volta in notHashedList significa che il suo contenuto è composto solo da file
        // o da directory con hash già calcolato, vado quindi a calcolare il suo hash e rimuoverla dalla lista
        if(createSubArray(notHashedList[i], notHashedList).length==1){
            hashedValue = calculateDirectoryHash(notHashedList[i],createSubArray(notHashedList[i], hashedList));
            //console.log(hashedList);
            hashedList = replaceSubstring(notHashedList[i], hashedValue, hashedList);
            hashedList.push(hashedValue);
            notHashedList.splice(i,1);
        }
        i=(i+1)%notHashedList.length;
        }
        return hashedList;
    }
    
    createDirectoryList(list){
        // Questa funzione fa schifo, funziona ma è da rifare
        var num,i;
        directoryList=Array();
        for (var path of list) {
        num = 0
        for (const segment of path.split('/')) {
            num++;
            if (segment !== '') {
                if (!(segment in directoryList)) {
                    if(num<path.split('/').length){
                    dirpath="";
                    for(i=0;i<num;i++){
                        dirpath+=path.split('/')[i];
                        if(i!=num-1){
                            dirpath+="/";
                        }
                    }
                    if(!directoryList.includes(dirpath))
                    directoryList.push(dirpath);
                    }
                }
            }
        }
        }
        var directoryList = directoryList.filter(function(e){return e});
        return directoryList;
    }
    
    // Data una lista di file, calcolo il loro hash
    createHashedList(list){
        var result = Array();
        list = list.filter(function(e){return e});
        for (var path of list) {
        result.push(path + ":h:" + fileHashSync(path));
        }
        result = result.filter(function(e){return e});
        return result;
    }

    
    // Data una substring, estraggo un sottoarray in cui quella substring è presente in ogni elemento
    createSubArray(substring, array){
        var result = Array();
        for (var el of array) {
        if(typeof el !== "undefined" &&  el.includes(substring)){
            result.push(el);
        }
        }
        return result;
    }

    
    // Data una substring s1, ne rimpiazzo ogni occorrenza con s2 in quell'array
    replaceSubstring(s1, s2, array){
        var result = Array();
        for (var el of array) {
        if(typeof el !== "undefined"){
            if(el.includes(s1)){
                el = el.replace(s1,s2);
            }
            result.push(el);
        }
        }
        return result;
    }
    
    // Uso la tecnica del merkle tree per generare gli hash delle directory
    calculateDirectoryHash(dirpath,contentslist){
        var lowerLevel = Array();
        for (var content of contentslist) {
        lowerLevel.push(content.split(":h:")[1]);
        }
        result = merkle.fromArray(lowerLevel,'sha1',true);
        //console.log(result[0][0]);
        return dirpath + ":h:" + result[0][0];
    }
}
 