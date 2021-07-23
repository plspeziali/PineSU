class LeafCalendar{

    #name;
    #day;
    #hour;
    #minute;
    #hash;
    #parent;
    
    constructor(name, day, hour, minute, hash, parent){
        this.#name = name;
        this.#day = day;
        this.#hour = hour;
        this.#minute = minute;
        this.#hash = hash;
        this.#parent = parent;
    }

    getName(){
        return this.#name;
    }

    getDay(){
        return this.#day;
    }

    getHour(){
        return this.#hour;
    }

    getMinute(){
        return this.#minute;
    }

    getHash(){
        return this.#hash;
    }

    getParent(){
        return this.#parent;
    }

}

module.exports = LeafCalendar;