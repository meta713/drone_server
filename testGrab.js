/**
 * 腕を開けたり閉じたりするテスト用プログラム
 * 実行前に、グラバーの装着が必要です
 */

var keypress = require('keypress');
var dronejs = require('dronejs');

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

// あなたのMamboの名前をセットしてください。
var DRONE_NAME = "XXXXXXXXXXXX";

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
 * ドローンを動かします
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
function main() {
  console.log('start')

  // ドローンの状態を受け取るイベントストリーム(rxjsのObservableオブジェクト)を取得します
  const navDataStream = dronejs.getNavDataStream();
  navDataStream.subscribe((data) => {
        console.log(data);
    },
    e => debug(e),
    () => debug('complete')
  );

  // ここから処理を書いていきます
  dronejs.connect(DRONE_NAME)
    .then(() => dronejs.grabClose()) // 腕を閉じる
    .then(() => dronejs.grabOpen()) // 腕を開く
    .then(() => dronejs.disconnect()) // 接続解除
    .then(() => {
      process.stdin.pause();
      process.exit();
    })
    .catch((e) => {
      console.log('エラー: ' + e);
      process.stdin.pause();
      process.exit();
    });
}

main(); // 関数を実行します
