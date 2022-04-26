const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['редирект'],
  description: 'переключить переадресацию сообщений',
  admin: true,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId < 2000000000) return sendMessage('Эта команда работает только в беседе.', groupId, {}, userId, null, 'low');
    if (!args[0]) return sendMessage('Использование: "редирект <id беседы>".', groupId, { defaultKeyboard }, userId);

    const id = parseInt(args[0]);
    const chatId = id <= 2000000000 ? id + 2000000000 : id;

    const cl = classes.find(e => e.groupId == chatId);

    cl.enableRedirect === true ? cl.enableRedirect = false : cl.enableRedirect = true;

    return sendMessage(`Редирект сообщений для беседы ${chatId} ${cl.enableRedirect ? 'включен' : 'выключен'}`, groupId, { defaultKeyboard }, userId, null, 'low');
  }
};
