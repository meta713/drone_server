var minidrone = require('dronejs');

minidrone.connect('Mambo_040276')
    .then(() => console.log("download start..."))
    .then(() => minidrone.listAllPictures())
    .then(pictures => minidrone.downloadPicture(pictures[pictures.length - 1], 'output'))
    .then(response => {
        if (response === 'success') {
            console.log('picture downloaded successfully...');
        }
    })
    .then(() => minidrone.disconnect())
    .then(() => console.log("end"))
    .catch((e) => {
        console.log('Error occurred: ' + e);
    });
