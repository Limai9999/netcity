const sendMessage = require('../utils/sendMessage');
const removeMessage = require('../utils/removeMessage');

module.exports = {
  name: ['удалить'],
  description: 'удалить сообщение из беседы',
  admin: true,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId < 2000000000) return sendMessage('Эта команда работает только в беседе.', userId, {}, userId, null, 'dontdelete');
    if (!args[1]) return sendMessage('Использование: "удалить <id беседы> <id сообщения>"', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

    const id = parseInt(args[0]);
    const msgId = args[1];

    const chatId = id <= 2000000000 ? id + 2000000000 : id;

    removeMessage(msgId, chatId.toString(), Class);

    return sendMessage(`Сообщение ${msgId} удалено из беседы ${chatId}.`, groupId, { defaultKeyboard }, userId, null, 'dontdelete');
  }
};
