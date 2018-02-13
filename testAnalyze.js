/**
 * Node.jsから画像の解析プログラムに対してリクエストを投げるテスト
 * ドローンとの接続は不要です
 */
var keypress = require('keypress');
const fs = require('fs');
const request = require('request');
const query = require('querystring');

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

function analyze(dirPath) {
  const fileNames = fs.readdirSync(dirPath)
    .filter(filename => !filename.startsWith('Mambo')) // テスト用の画像のみを解析します
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
}


/**
 * 数値の解析を行います
 */
function main() {
  console.log('start')

  var result;
  analyze('output')
    .then(analyzed_result => {
      console.log('--------------------------------------------------------')
      console.log(analyzed_result);
      console.log('--------------------------------------------------------')
    })
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
