var proc = function(name){
  const { spawn } = require('child_process');
  const ls = spawn('node', ['./testf.js',name]);

  ls.stdout.on('data', (data) => {
    var d = `${data}`;
    if(d.trim().match(/^END$/)){
      ls.stdin.pause();
      ls.kill();
    }else{
      console.log(JSON.parse(d.trim()));
      broadcast(JSON.stringify({knownDevices:knownDevices, flag: "connecting", api: d.trim()}));
    }
    //ls.stdin.pause();
    //ls.kill();
  });

  ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  ls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
};
