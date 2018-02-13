var WebSocketServer = require('ws').Server
    , http = require('http')
    , express = require('express')
    , app = express();

app.use(express.static(__dirname + '/'));
var server = http.createServer(app);
var wss = new WebSocketServer({server:server});
var minidrone = require('dronejs');
//Websocket接続を保存しておく
var connections = [];

//接続時
wss.on('connection', function (ws) {

  //最初のコネクション作成時にドローンと接続、情報を送信
  ws.send(JSON.stringify({drone_name: 'Mambo_040276'}));

      // .then(() => minidrone.checkAllStates())
      // .then((data) => console.log(data))
      // .then(() => minidrone.disconnect())
      // .then(() => console.log("end"))
      // .catch((e) => {
      //     console.log('Error occurred: ' + e);
      // });

    //配列にWebSocket接続を保存
    connections.push(ws);
    //切断時
    ws.on('close', function () {
        connections = connections.filter(function (conn, i) {
            return (conn === ws) ? false : true;
        });
    });
    //メッセージ送信時
    ws.on('message', function (message) {
        console.log('message:', message);
        //broadcast(message);
    });
});

//ブロードキャストを行う
function broadcast(message) {
    connections.forEach(function (con, i) {
        con.send(message);
    });
};

server.listen(8989);
