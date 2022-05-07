const CryptoJS = require('crypto-js');

function passwordManager(type, password) {
  const key = process.env.PASSWORD_DECRYPT_KEY;
  if (type === 'encrypt') {
    const encryptedPassword = CryptoJS.AES.encrypt(password, key).toString();
    return encryptedPassword;
  } else if (type === 'decrypt') {
    const decryptedPassword = CryptoJS.AES.decrypt(password, key).toString(CryptoJS.enc.Utf8);
    return decryptedPassword;
  }
}

module.exports = passwordManager;
