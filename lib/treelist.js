var merkle = require('./merkle');

class TreeList{
    // Data una lista di file, ne crea un albero
    createTree(list){
        var result = {};
        list.forEach(p => p.split('/').reduce((o, k) => o[k] = o[k] || {}, result));
        return result;
    }

    createHashTree(list){
        // Creo una lista notHashedList in cui sono presenti, per ora, tutte le directory
        var notHashedList=this.createDirectoryList(list);
        var hashedList=this.createHashedList(list);
        // vado a calcolare l'hash delle directory tramite il metodo introdotto dai Merkle Trees e le rimuovo gradualmente
        // da notHashedList per metterle in hashedList
        var i = 0;
        while(typeof notHashedList !== 'undefined' && notHashedList.length > 0){
        // Se una directory è presente solo una volta in notHashedList significa che il suo contenuto è composto solo da file
        // o da directory con hash già calcolato, vado quindi a calcolare il suo hash e rimuoverla dalla lista
        if(this.createSubArray(notHashedList[i], notHashedList).length==1){
            var hashedValue = this.calculateDirectoryHash(notHashedList[i],this.createSubArray(notHashedList[i], hashedList));
            //console.log(hashedList);
            hashedList = this.replaceSubstring(notHashedList[i], hashedValue, hashedList);
            hashedList.push(hashedValue);
            notHashedList.splice(i,1);
        }
        i=(i+1)%notHashedList.length;
        }
        var o = {}
        var key = this.calculateDirectoryHash("root",this.createCompSubArray('/',hashedList));
        o[key] = this.createTree(hashedList);
        return o;
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
                        var dirpath="";
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
            result.push(path + ":" + merkle.fileHashSync(path));
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

    // Data una substring, estraggo un sottoarray in cui quella substring non è presente in ogni elemento
    createCompSubArray(substring, array){
        var result = Array();
        for (var el of array) {
            if(typeof el !== "undefined" &&  !el.includes(substring)){
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
                // Non solo la stringa deve essere contenuta, ma dato che si tratta di una sositutzione
                // dell'intero percorso fino a quella cartella mi assicuro che l'inclusione parta
                // dal primo carattere
                var eln = el;
                if(el.substring(0,s1.length).includes(s1)){
                    eln = s2+el.substring(s1.length)
                }
                result.push(eln);
            }
        }
        return result;
    }
    
    // Uso la tecnica del merkle tree per generare gli hash delle directory
    calculateDirectoryHash(dirpath,contentslist){
        var lowerLevel = Array();
        for (var content of contentslist) {
            lowerLevel.push(content.split(":")[1]);
        }
        var result = merkle.fromArray(lowerLevel,'sha1',true);
        //console.log(result[0][0]);
        return dirpath + ":" + result[0][0];
    }
}

module.exports = TreeList;