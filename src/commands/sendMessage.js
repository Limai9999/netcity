const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['отправить'],
  description: 'отправить сообщение в беседу',
  admin: true,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId < 2000000000) return sendMessage('Эта команда работает только в беседе.', userId, {}, userId, null, 'dontdelete');
    if (!args[1]) return sendMessage('Использование: "отправить <id беседы> <сообщение>"', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

    const id = parseInt(args[0]);
    const chatId = id <= 2000000000 ? id + 2000000000 : id;

    const messageToSend = args.join(' ').replace(args[0], '');

    sendMessage(messageToSend, chatId, { defaultKeyboard }, userId, null, 'dontdelete');
    return sendMessage(`Сообщение отправлено в беседу ${chatId}.\nChechnya LTD: ${messageToSend}`, groupId, { defaultKeyboard }, userId, null, 'dontdelete');
  }
};
