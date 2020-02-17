try {
  var MPR121 = require('node-picap');

  this.mpr121 = new MPR121('0x5C');

  this.mpr121.on('data', data => {
    data.forEach((electrode, i) => {
      if (electrode.isNewTouch) {
        console.log(JSON.stringify({
          index: i,
          type: 'touch',
        }));
      } else if (electrode.isNewRelease) {
        console.log(JSON.stringify({
          index: i,
          type: 'release',
        }));
      }
    });
  });
} catch (err) {}
