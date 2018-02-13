var keypress = require('keypress');
var dronejs = require('dronejs');
var fs = require('fs');


keypress(process.stdin);
process.stdin.setRawMode(true);
process.stdin.resume();

// あなたのMamboの名前をセットしてください。
var DRONE_NAME = "Mambo_637131";

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

// outputディレクトリにある画像を削除する
fs.readdir('output', (err, files) => {
  files
    .filter(filename => filename.startsWith('Mambo'))
    .forEach(filename => {
      fs.unlink(`output/${filename}`);
    });
});

// Droneにある画像を全て削除する
function deleteAllPictures() {
  dronejs.connect(DRONE_NAME)
    .then(() => dronejs.listAllPictures())
    .then(pictures => {
      console.log(pictures)
      return pictures.reduce((promise, picture) => {
        return promise.then((result) => {
          console.log('start', picture, 'deletion')
          return new Promise((resolve, reject) => {
            dronejs.deletePicture(picture)
                .then(
                  status => console.log(status) || resolve(status),
                  error => console.log(error) || reject(error)
                )
          })
        });
      }, Promise.resolve());
    
    })
    .then(x => {
        process.stdin.pause();
        process.exit();
    });
}

deleteAllPictures();
