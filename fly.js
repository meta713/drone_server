var dronejs = require('dronejs');
var name = process.argv[2];
var x = process.argv[3];
var y = process.argv[4];
var z = 1;

function main(name, x, y, z) {
  // 一時的にup関数を排除、 upする -> true  upしない -> false
  var up_flag = false;
  // ドローンの状態を受け取るイベントストリーム(rxjsのObservableオブジェクト)を取得します
  const navDataStream = dronejs.getNavDataStream();
  navDataStream.subscribe((data) => {
        console.log(JSON.stringify({data:data}));
    },
    e => debug(e),
    () => debug('complete')
  );

  //******************************************************************************************
  // ここから処理を書いていきます
    var button_x = x;  //押されたボタンの座標
    var button_y = y;
    var button_z = z;

    var default_x = 1; //ドローンの初期座標
    var default_y = 1;
    var default_z = 1;

    //ドローンの動くべき格子数
    var x = button_x - default_x;
    var y = button_y - default_y;

    var i;
  var d = dronejs.connect(name);
    //button_zが-1以外の時飛行を実行
    if(button_z != -1){
        d = d.then(() => dronejs.flatTrim()) // 飛ぶ前に一度平坦な状態を覚える
        .then(() => dronejs.takeOff()) // 離陸
        .then(() => dronejs.flatTrim());

    //z方向の移動
        //button_xが7以上の時は高さを185cmにする
        if(button_x >= 7 && up_flag){
            d = d.then(() => dronejs.up(85,1))
            .then(() => dronejs.up(85,1));
        }else if(up_flag){ //それ以外は高さを225cmに
            d = d.then(() => dronejs.up(85,1))
            .then(() => dronejs.up(85,1))
            .then(() => dronejs.up(85,1));
        }
        d = d.then(() => dronejs.flatTrim())
        .then(() => dronejs.flatTrim());

    //x方向の移動
        if(x >= 0){

          for(i=0 ; i<x ; i++){
            d = d.then(() => dronejs.forward(85,1))
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim());
          }

        }else{　//xが負なら反転して移動
          d = d.then(() => dronejs.turnRight(70,9))
          .then(() => dronejs.flatTrim());
          x = x*-1;
          for(i=0 ; i<x ; i++){

            d = d.then(() => dronejs.forward(85,1))
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim());
          }
        }

        //y方向の移動
        if(y >= 0){
          //yが正ならば左に回転して移動
          d = d.then(() => dronejs.turnLeft(30,3.8))
          .then(() => dronejs.flatTrim());
          for(i=0 ; i<y ; i++){
            d = d.then(() => dronejs.forward(85,1))
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim());
          }

        }else{　//yが負なら右に回転して移動
          d = d.then(() => dronejs.turnRight(70,3.8))
          .then(() => dronejs.flatTrim());
          y = y*-1;
          for(i=0 ; i<y ; i++){
            d = d.then(() => dronejs.flatTrim())
            .then(() => dronejs.forward(85,1))
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim())
            .then(() => dronejs.flatTrim());
          }
        }






        d.then(() => dronejs.flatTrim())
        .then(() => dronejs.listAllPictures())
        .then((pictures) => dronejs.downloadPicture(pictures[pictures.length - 1], 'output'))
        .then(() => dronejs.land()) // 着陸する
        .then(() => dronejs.disconnect()) // 接続解除
        .then(() => console.log("END"))
        .catch((e) => {
          // 以上終了した場合、エラーの内容をコンソールに表示し、終了する
          console.log('Error occurred: ' + e);
          console.log("END");
        });
    }
}

main(name, x, y, z); // 関数を実行します
