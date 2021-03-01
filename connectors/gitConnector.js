const git = simpleGit(".");
var num;
var fileslist;

function init(){
    git.checkIsRepo()
        .then(isRepo => !isRepo && git.init())
        .then(() => git.fetch())
        .then(() => git.raw('rev-list','--all','--count',(err,log) => num = log))
}

function add(_arg){
    git.add(_arg);
}

function addAll(){
    git.add('./*')
}

function commit(_msg,_enmsg){
    if(_enmsg){
        git.commit(_msg)
            .raw('rev-list','--all','--count',(err,log) => num = log);
    } else {
        git.commit("commit #" + num + " by PineSU")
            .raw('rev-list','--all','--count',(err,log) => num = log);
    }
}

async function getRepoFiles(){
    try{
        return await git.raw('ls-tree','--full-tree','-r','--name-only','HEAD',(err, log) => {return log.split("\n")});
    } catch (e) {
        // TODO
    }
}

function addRemote(_user,_pass,_repo){
    git().silent(true)
        .clone(`https://${_user}:${_pass}@${_repo}`)
        .then(() => console.log('finished'))
        .catch((err) => console.error('failed: ', err));
}

function push(){
    git.push('origin', 'master')
}

function pull(){
    git.pull();
}

function custom(_commands){
    git(path).raw(_commands, (err, result) => {
        if(err){
            console.error(err);
        } else {
            console.log(result);
        }
    });
}