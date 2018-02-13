/**
 * 飛んで着陸するだけのテスト用プログラム
 */
var keypress = require('keypress');
var dronejs = require('dronejs');

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

// あなたのMamboの名前をセットしてください。
var DRONE_NAME = "Mambo_492514";

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress" => ', key);
  if (key) {
    if (key.name === 'x') {
      // xキーを押すとプログラムを終了する。
      console.log('close. bye.');
      process.stdin.pause();
      process.exit();
    }
  }
});


/**
 * ドローンを動かす関数を定義します
 *
 * 使い方:
 *   dronejs.connect(DRONE_NAME)から初めて、.thenで処理を続けて書いていきます。
 *   最後は.catch()でエラー処理を書いて、;を書いて処理を終了させます。
 *
 * コマンド:
 *
 *   飛行状態を変化:
 *     離陸   : dronejs.takeOff()
 *     安定化 : dronejs.flatTrim() : 離陸前に必ず1度呼ぶ
 *     着陸   : dronejs.land()
 *
 *   移動:
 *     前進     : dronejs.forward()   : 引数には、進む強さと回数を指定する
 *     後退     : dronejs.backward()  : 引数には、進む強さと回数を指定する
 *     右に進む : dronejs.right()     : 引数には、進む強さと回数を指定する
 *     左に進む : dronejs.left()      : 引数には、進む強さと回数を指定する
 *     上昇     : dronejs.up()        : 引数には、進む強さと回数を指定する
 *     下降     : dronejs.down()      : 引数には、進む強さと回数を指定する
 *     右を向く : dronejs.turnRight() : 引数には回転の強さと回数を指定する
 *     左を向く : dronejs.turnLeft()  : 引数には回転の強さと回数を指定する
 *
 *   Grabberを動かす:
 *     つかむ: dronejs.grabClose()
 *     はなす: dronejs.grabOpen()
 *
 *   アクロバット:
 *     前転     : dronejs.frontFlip()
 *     後転     : dronejs.backFlip()
 *     側転(右) : dronejs.rightFlip()
 *     側転(左) : dronejs.leftFlip()
 *
 *   写真:
 *     撮影         : dronejs.takePicture()
 *     一覧を取得   : dronejs.listAllPictures()
 *     ダウンロード : dronejs.downloadPicture()
 *     画像を削除   : dronejs.deletePicture()
 *
 *   その他:
 *     ログを出力する           : dronejs.enableLogging()  : 引数にログを出すディレクトリを指定
 *     ドローンの状態を確認する : dronejs.checkAllStates() : ドローンの詳しい状態が送られてきます
 *
 */
function main(x, y, z) {
  console.log('start')

  // ドローンの状態を受け取るイベントストリーム(rxjsのObservableオブジェクト)を取得します
  const navDataStream = dronejs.getNavDataStream();
  navDataStream.subscribe((data) => {
        console.log(data);
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
  var d = dronejs.connect(DRONE_NAME);
    //button_zが-1以外の時飛行を実行
    if(button_z != -1){
        d = d.then(() => dronejs.flatTrim()) // 飛ぶ前に一度平坦な状態を覚える
        .then(() => dronejs.takeOff()) // 離陸
        .then(() => dronejs.flatTrim());

    //z方向の移動
        //button_xが7以上の時は高さを185cmにする
        if(button_x >= 7){
            d = d.then(() => dronejs.up(85,1))
            .then(() => dronejs.up(85,1));
        }else{ //それ以外は高さを225cmに
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






        d.then(() => dronejs.land()) // 着陸する
        .then(() => dronejs.disconnect()) // 接続解除
        .then(() => {
          // 正常終了した場合、プログラムを終了する
          process.stdin.pause();
          process.exit();
        })
        .catch((e) => {
          // 以上終了した場合、エラーの内容をコンソールに表示し、終了する
          console.log('エラー: ' + e);
          process.stdin.pause();
          process.exit();
        });
    }
}

main(); // 関数を実行します
