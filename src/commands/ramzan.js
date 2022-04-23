const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: 'рамзан',
  description: 'тест-команда',
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    return sendMessage('Здравствуйте', groupId, { defaultKeyboard }, userId, null, 'low');
  }
};
