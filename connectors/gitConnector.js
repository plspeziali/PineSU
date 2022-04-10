const simpleGit = require('simple-git');
simpleGit().clean(simpleGit.CleanOptions.FORCE);

class GitConnector{

    constructor(dir){
        this.git = simpleGit(dir);
    }

    init(){
        this.git.checkIsRepo()
            .then(isRepo => !isRepo && this.git.init())
            .then(() => this.git.fetch());
    }

    async add(_arg){
        await this.git.add(_arg);
    }

    async add(){
        await this.git.add('./*')
    }

    async commit(_msg,_enmsg){
        if(!_enmsg){
            await this.git.raw('rev-list','--all','--count',(err,log) => {
                if(typeof(log) !== "undefined"){
                    _msg = "commit #" + log.replace("\n","") + " by PineSU"
                }else{
                    _msg = "commit #1 by PineSU"
                }
                
            });
        }
        return this.git.commit(_msg);
    }

    async getRepoFiles(){
        try{
            return this.git.raw('ls-tree','--full-tree','-r','--name-only','HEAD',(err, log) => {return log.split("\n")});
        } catch (e) {
            // TODO
        }
    }

    async addRemote(_repo){
        try{
            return this.git.addRemote('origin', _repo);
        } catch (e) {
            // TODO
        }
    }

    async push(){
        return this.git.push('origin', 'master');
    }

    pull(){
        this.git.pull();
    }

    reset(){
        this.git.reset("--hard","HEAD~1");
    }

    async log(){
        return this.git.log();
    }

    async hasRemote(){
        return this.git.listRemote(['--get-url'], (err, data) => {
            if (!err) {
                return typeof (data) !== "undefined" && data !== "";
            }
            return false;
        });
    }

    async getRemote(){
        return this.git.raw("config", "--get", "remote.origin.url");
    }

    async setRemote(url){
        if(this.getRemote().length == 0){
            await this.git.raw("remote", "add", "master", url, (err, result) => {
                return !err;
            });
        } else {
            
        }
    }

    async custom(_commands){
        return this.git.raw(_commands, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
            }
        })
            .raw('rev-list', '--all', '--count', (err, log) => {
                return log
            });
    }
}

module.exports = GitConnector;