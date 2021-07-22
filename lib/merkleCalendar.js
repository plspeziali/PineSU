class MerkleCalendar{
    
    constructor(){
        this.closed = new internalCalendar("Closed",0,null);
        this.open = new internalCalendar("Open",0,null);
    }

}

module.exports = MerkleCalendar;