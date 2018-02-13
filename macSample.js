var keypress = require('keypress');
var rxjs = require('rxjs');
var dronejs = require('dronejs');
const cp = require('child_process');
const fs = require('fs');
const request = require('request');
const query = require('querystring');

keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

// あなたのMamboの名前をセットしてください。
var DRONE_NAME = "Mambo_040276";

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


function downloadAllPictures() {
  // 画像を一つずつ順番にダウンロードします
  console.log('download start');
  return dronejs.listAllPictures()
    .then(pictures => {
      return pictures.reduce((promise, picture) => {
        return promise
          .then((result) => {
            console.log('previous result', result);
            console.log(picture, 'download start');
            return dronejs.downloadPicture(picture, 'output');
          })
          .catch(console.log);
      }, Promise.resolve());
    });
}

function analyze(dirPath) {
  const fileNames = fs.readdirSync(dirPath)
    .filter(filename => filename.startsWith('Mambo'))
    .filter(filename => filename.endsWith('jpg'))
    .map(filename => dirPath + '/' + filename)
    .join(',');

  console.log(fileNames)
  return new Promise((resolve, reject) => {
    const options = {
      url: `http://localhost:5000?filenames=${query.escape(fileNames)}`,
      method: 'GET',
      json: true,
    }
    request(options, (error, response, body) => {
      if (error) {
        reject(error);
        console.log('解析に失敗しました。終了します');
        process.exit();
      }
      if (body) {
        resolve(body);
      } else {
        reject(body)
      }
    });
  })
//  var array = [1,2,3]
//  return array[ Math.floor( Math.random() * array.length ) ] ;
}

function landingAndGrabOpen(result, num) {
  return Promise.resolve()
    .then(() => result === num ? dronejs.flatTrim() : Promise.resolve())
    .then(() => result === num ? dronejs.land() : Promise.resolve())
    .then(() => result === num ? dronejs.grabOpen() : Promise.resolve())
    .then(() => result === num ? dronejs.flatTrim() : Promise.resolve())
    .then(() => result === num ? dronejs.takeOff() : Promise.resolve())
}

function grabOpen(result, num) {
  return Promise.resolve()
    .then(() => result === num ? dronejs.grabOpen() : Promise.resolve())
}

class NumberAnalyzer {
  start() {
    this.proc = cp.spawn('python', ['run_server.py']);
    return new Promise((resolve, reject) => {
      var cnt = 0;
      this.proc.stdout.on('data', (data) => {
        resolve(data);
      });
      this.proc.stderr.on('data', (data) => {
        if (cnt == 0) {
          console.log('python server started')
        }
        cnt += 1;
        if (cnt == 1) {
          resolve(data);
        }
        console.log('python: ', data);
      });
    })
  }
  stop() {
    this.proc.kill('SIGINT');
  }
}

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

//  const forwardIndensity = 53;
//  const forwardTimes = 2;
  const forwardIndensity = 30;
  const forwardTimes = 1;
  // ---------------------------------------------------------------
  const targetNumber = 2; // こちらに指示された番号を入力します
  // ---------------------------------------------------------------
  var result;
  // ここから処理を書いていきます
  dronejs.connect(DRONE_NAME)
    // 飛ぶ前に一度平坦な状態を覚える
    .then(() => dronejs.flatTrim())
    // 物を掴んで離陸
    .then(() => dronejs.grabClose())
    .then(() => dronejs.takeOff())
    // 前進しながら写真を撮る
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    .then(() => dronejs.takePicture())
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    .then(() => dronejs.takePicture())
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    .then(() => dronejs.takePicture())
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    .then(() => dronejs.flatTrim())
    // 着陸して分析する
    .then(() => dronejs.land())
    .then(() => downloadAllPictures())
    // .then(() => analyze('output')) // 分析結果には、何番目に撮影した写真か？が返る
    // .then(analyzed_result => {
    //   result = analyzed_result.indexOf(targetNumber) + 1;
    //   console.log('--------------------------------------------------------')
    //   console.log(analyzed_result);
    //   console.log('position: ', result);
    //   console.log('--------------------------------------------------------')
    // })
    // 離陸する
    .then(() => dronejs.flatTrim())
    .then(() => dronejs.takeOff())
    // 反転する
    .then(() => dronejs.turnRight(90, 7))
    // 戻る
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    .then(() => grabOpen(result, 1))
    .then(() => dronejs.flatTrim())
    .then(() => dronejs.flatTrim())
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    .then(() => grabOpen(result, 2))
    .then(() => dronejs.flatTrim())
    .then(() => dronejs.flatTrim())
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    .then(() => grabOpen(result, 3))
    .then(() => dronejs.flatTrim())
    .then(() => dronejs.flatTrim())
    .then(() => dronejs.forward(forwardIndensity, forwardTimes))
    // 着陸する
    .then(() => dronejs.land())
    // 接続解除
    .then(() => dronejs.disconnect())
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
