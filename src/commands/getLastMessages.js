const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['сообщения'],
  description: 'получить последние сообщения в беседе',
  admin: true,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (!args[0]) return sendMessage('Использование: "сообщения <ID беседы> <кол-во сообщений>".', groupId, { defaultKeyboard }, userId);

    return sendMessage('', userId, { defaultKeyboard }, userId, null, 'low');
  }
};
