class InternalCalendar{

    #name;
    #category;    //0: Open or Closed Subtree root, 1: year, 2: month
    #parent;
    #children;
    
    constructor(name, category, parent){
        this.#name = name;
        this.#category = category;
        this.#parent = parent;
        this.#children = new Array();
    }

}

module.exports = InternalCalendar;