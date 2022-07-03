class LeafCalendar {

    #name;
    #day;
    #hour;
    #minute;
    #second;
    #hash;
    #parent;
    #storageGroup;
    // aggiungere lista degli hash delle SU

    constructor(name, day, hour, minute, second, hash, parent, storageGroup) {
        this.#name = name;
        this.#day = day;
        this.#hour = hour;
        this.#minute = minute;
        this.#second = second;
        this.#hash = hash;
        this.#parent = parent;
        this.#storageGroup = storageGroup;
    }

    getName() {
        return this.#name;
    }

    getDay() {
        return this.#day;
    }

    getHour() {
        return this.#hour;
    }

    getMinute() {
        return this.#minute;
    }

    getSecond() {
        return this.#second;
    }

    getHash() {
        return this.#hash;
    }

    getParent() {
        return this.#parent;
    }

    getStorageGroup() {
        return this.#storageGroup;
    }
}

module.exports = LeafCalendar;