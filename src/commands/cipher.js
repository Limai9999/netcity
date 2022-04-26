const sendMessage = require('../utils/sendMessage');
const CryptoJS = require('crypto-js');

module.exports = {
  name: ['шифр'],
  description: 'зашифровать пароль',
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId >= 2000000000) return sendMessage('Эта команда работает только в личных сообщениях.', groupId, {}, userId, null, 'low');
    if (!args[0]) return sendMessage('Использование: "шифр <пароль>".', groupId, { defaultKeyboard }, userId);

    const code = CryptoJS.AES.encrypt(args[0], config.decryptKey).toString();
    return sendMessage(code, userId, { defaultKeyboard }, userId, null, 'low');
  }
};
