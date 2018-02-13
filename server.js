'use strict';

var noble = require('noble');
var knownDevices = [];

var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();

app.use(express.static(__dirname + '/'));
var server = http.createServer(app);
var wss = new WebSocketServer({server:server});

var minidrone = require('dronejs');

var connections = [];

server.listen(7777);

var findDeviceByUuid = function(uuid){
  return knownDevices.find(function(d){
    return d.uuid === uuid;
  });
};

var updateKnownDevice = function(device){
  var d = findDeviceByUuid(device.uuid);
  d.battery = device.battery;
  d.isConnecting = device.isConnecting;
  d.isFlying = device.isFlying;
};

//ブロードキャストを行う
function broadcast(message) {
    connections.forEach(function (con, i) {
        con.send(message);
    });
};

var connect_proc = function(name){
  const { spawn } = require('child_process');
  const ls = spawn('node', ['./testf.js',name]);

  ls.stdout.on('data', (data) => {
    var d = `${data}`;
    if(d.trim().match(/^END$/)){
      ls.stdin.pause();
      ls.kill();
    }else{
      // console.log(JSON.parse(d.trim()));
      broadcast(JSON.stringify({knownDevices:knownDevices, flag: "connecting", api: JSON.parse(d.trim())}));
    }
    //ls.stdin.pause();
    //ls.kill();
  });

  ls.stderr.on('data', (data) => {
    // console.log(`stderr: ${data}`);
  });

  ls.on('close', (code) => {
    // console.log(`child process exited with code ${code}`);
  });
};

var fly_proc = function(name, x, y){
  console.log("func fly_proc");
  const { spawn } = require('child_process');
  const ls = spawn('node', ['./fly.js', name, x, y]);

  ls.stdout.on('data', (data) => {
    console.log(data);
    var d = `${data}`;
    if(d.trim().match(/^END$/)){
      ls.stdin.pause();
      ls.kill();
      broadcast(JSON.stringify({knownDevices:knownDevices, flag: "complete"}));
    }else{
      // console.log(JSON.parse(d.trim()));
      broadcast(JSON.stringify({knownDevices:knownDevices, flag: "flying", api: JSON.parse(d.trim())}));
    }
    //ls.stdin.pause();
    //ls.kill();
  });

  ls.stderr.on('data', (data) => {
    // console.log(`stderr: ${data}`);
  });

  ls.on('close', (code) => {
    // console.log(`child process exited with code ${code}`);
  });
};

if (noble.state === 'poweredOn') {
  start();
} else {
  noble.on('stateChange', start);
}

//接続時
wss.on('connection', function (ws) {

  //最初のコネクション作成時にドローンと接続、情報を送信
  ws.send(JSON.stringify({knownDevices:knownDevices, flag: "updateDevices"}));

    //配列にWebSocket接続を保存
    connections.push(ws);
    //切断時
    ws.on('close', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });

    ws.on('error', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });
    //メッセージ送信時
    ws.on('message', function (message) {
        //console.log('message:', message);
        var data = JSON.parse(message);
        switch(data["flag"]){
          case "connecting": {
            updateKnownDevice(data["rd"]);
            connect_proc(data["rd"]["name"]);
            break;
          }
          case "flying": {
            console.log("flying");
            updateKnownDevice(data["rd"]);
            fly_proc(data["rd"]["name"], data["x"], data["y"]);
            //broadcast(JSON.stringify({knownDevices:knownDevices, flag: "flying", api: JSON.parse(d.trim())}));
            break;
          }
          default: {
            console.log("error!");
            break;
          }
        }
    });
});

function start () {
  noble.startScanning();

  noble.on('discover', function(peripheral) {
    //if(peripheral.advertisement.localName && peripheral.advertisement.localName.indexOf('Mambo_') === 0){
      var details = {
        name: peripheral.advertisement.localName || "不明なデバイス",
        uuid: peripheral.uuid,
        rssi: peripheral.rssi,
        battery: 0,
        isConnecting: false,
        isFlying: false
      };

      //console.log(peripheral);
      knownDevices.push(details);
      broadcast(JSON.stringify({knownDevices:knownDevices, flag: "updateDevices"}));
      //console.log(details);
    // }
  });
}
