const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = async ({url, data, headers, method = 'POST', i}) => {
  const filenameEncoded = path.basename(url);
  const filename = decodeURI(filenameEncoded);

  return new Promise((resolve) => {
    setTimeout(async () => {
      await fetch(url, {
        method,
        headers,
        body: data,
        responseType: 'blob',
        validateStatus: false,
      }).then((response) => {
        const fileStream = fs.createWriteStream('./src/xlsxFiles/' + filename);
        response.body.pipe(fileStream);

        fileStream.on('error', (err) => {
          console.log(err);
          resolve({
            status: false,
            err,
          });
        });

        fileStream.on('close', () => {
          resolve({
            status: true,
            filename,
          });
        });

        fileStream.on('finish', () => {
          fileStream.close();
        });
      }).catch((err) => {
        console.log(err);
        resolve({
          status: false,
          err,
        });
      });
    }, 300 * i);
  });
};
