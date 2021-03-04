var simpleGit = require('simple-git');

class GitConnector{

    constructor(dir){
        this.git = simpleGit(dir);
    }

    init(){
        this.git.checkIsRepo()
            .then(isRepo => !isRepo && this.git.init())
            .then(() => this.git.fetch());
    }

    add(_arg){
        this.git.add(_arg);
    }

    add(){
        this.git.add('./*')
    }

    async commit(_msg,_enmsg){
        if(_enmsg){
            return await this.git.commit(_msg);
        } else {
            return await this.git.raw('rev-list','--all','--count',(err,log) => {this.git.commit("commit #" + log.replace("\n","") + " by PineSU")});
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