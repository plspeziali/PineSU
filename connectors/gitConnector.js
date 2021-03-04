var simpleGit = require('simple-git');

class GitConnector{

    constructor(dir){
        this.git = simpleGit(dir);
        this.num = 0;
    }

    init(){
        this.git.checkIsRepo()
            .then(isRepo => !isRepo && this.git.init())
            .then(() => this.git.fetch())
            .then(() => this.git.raw('rev-list','--all','--count',(err,log) => this.num = log))
    }

    add(_arg){
        this.git.add(_arg);
    }

    add(){
        this.git.add('./*')
    }

    commit(_msg,_enmsg){
        if(_enmsg){
            this.git.commit(_msg)
                .raw('rev-list','--all','--count',(err,log) => this.num = log);
        } else {
            this.git.commit("commit #" + this.num + " by PineSU")
                .raw('rev-list','--all','--count',(err,log) => this.num = log);
        }
    }

    async getRepoFiles(){
        try{
            return this.git.raw('ls-tree','--full-tree','-r','--name-only','HEAD',(err, log) => {return log.split("\n")});
        } catch (e) {
            // TODO
        }
    }

    addRemote(_user,_pass,_repo){
        this.git.silent(true)
            .clone(`https://${_user}:${_pass}@${_repo}`)
            .then(() => console.log('finished'))
            .catch((err) => console.error('failed: ', err));
    }

    push(){
        this.git.push('origin', 'master')
    }

    pull(){
        this.git.pull();
    }

    custom(_commands){
        this.git.raw(_commands, (err, result) => {
            if(err){
                console.error(err);
            } else {
                console.log(result);
            }
        })
        .raw('rev-list','--all','--count',(err,log) => this.num = log);
    }
}

module.exports = GitConnector;