var minidrone = require('dronejs');
var name = process.argv[2];
//var name = 'Mambo_492514';

drone_connection(name);

function drone_connection(name){

  var count = 0;
  // ドローンの状態を受け取るイベントストリーム(rxjsのObservableオブジェクト)を取得します
  const navDataStream = minidrone.getNavDataStream();
  navDataStream.subscribe((data) => {
        console.log(JSON.stringify({data:data}));
    },
    e => debug(e),
    () => debug('complete')
  );

  minidrone.connect(name)
    .then(() => minidrone.enableLogging("outlog"))
    .then(() => minidrone.checkAllStates())
    .then(() => minidrone.disconnect())
    .then(() => console.log("END"))
    .catch((e) => {
        console.log('Error occurred: ' + e);
    });

}
