const { writeFileSync } = require('fs');

module.exports = (config) => {
  console.log('autosave enabled');

  setInterval(() => {
    writeFileSync('./src/data/classes.json', JSON.stringify(config));
  }, 15000);
};
