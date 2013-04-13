var http = require('http')
var st = require('st')
var cp = require('child_process')
var npmExe = process.argv[2] || 'npm'
var port = 3243
var path = require('path')
var assert = require('assert')
var parentRepoPath = path.join(__dirname,'parentRepo')
var subRepoPath = path.join(__dirname,'subRepo')
var parentRepoUrl = 'http://localhost:'+port+'/parentRepo/.git'
var subRepoUrl = 'http://localhost:'+port+'/subRepo/.git'
var mount = st({path:__dirname,dot:true})

http.createServer(mount).listen(port,run)

function run() {
  prepare(function(err){
    if (err) return exit(err)
    test(function(err){
      if (err) return exit(err)
      // cleanup(function(err){
      //   if (err) return exit(err)
        exit()
      // })                              
    })
  })
}

function prepare(cb) {
  cp.exec( 'git init . && git add . && git commit -am"initial" '
         + '&& git update-server-info'
         , {cwd:subRepoPath}
         , function(err,stdout,stderr){
    if (err) return cb(err)
    cp.exec( 'git init . && git add . '
           + '&& git submodule add '+subRepoUrl+' '
           + '&& git commit -am"initial" '
           + '&& git update-server-info'
           , {cwd:parentRepoPath}
           , function(er,stdout,stderr){
      if (err) return cb(err)
      cb()
    })    
  })
}

function test(cb) {
  cp.exec(npmExe+' i git+'+parentRepoUrl+' --verbose',function(err,stdout,stderr){
    if (err) return cb(err)
    cp.exec('node -e "require(\'parentRepo\')()"',function(err,stdout,stderr){
      if (err) return cb(err)
      assert.equal(stdout.replace(/\n/,''),'subRepo')
      cb()
    })
  })
}

function cleanup(cb) {
  cp.exec('make clean', cb)
}

function exit(err) {
  if (err) throw new Error(err)
  console.log('ok')
  process.exit()
}
