module.exports = {

    addToTree(name, hash, mc, closed){
        mc.addRegistration(name, hash, Date.now(), closed);
    },

}