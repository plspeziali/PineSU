const git = simpleGit(".");
var num;
var fileslist;


class GitConnector{
    init(){
        git.checkIsRepo()
            .then(isRepo => !isRepo && git.init())
            .then(() => git.fetch())
            .then(() => git.raw('rev-list','--all','--count',(err,log) => num = log))
    }

    add(_arg){
        git.add(_arg);
    }

    add(){
        git.add('./*')
    }

    commit(_msg,_enmsg){
        if(_enmsg){
            git.commit(_msg)
                .raw('rev-list','--all','--count',(err,log) => num = log);
        } else {
            git.commit("commit #" + num + " by PineSU")
                .raw('rev-list','--all','--count',(err,log) => num = log);
        }
    }

    async getRepoFiles(){
        try{
            return await git.raw('ls-tree','--full-tree','-r','--name-only','HEAD',(err, log) => {return log.split("\n")});
        } catch (e) {
            // TODO
        }
    }

    addRemote(_user,_pass,_repo){
        git().silent(true)
            .clone(`https://${_user}:${_pass}@${_repo}`)
            .then(() => console.log('finished'))
            .catch((err) => console.error('failed: ', err));
    }

    push(){
        git.push('origin', 'master')
    }

    pull(){
        git.pull();
    }

    custom(_commands){
        git(path).raw(_commands, (err, result) => {
            if(err){
                console.error(err);
            } else {
                console.log(result);
            }
        });
    }
}