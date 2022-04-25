const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['редирект'],
  description: 'переключить переадресацию сообщений',
  admin: true,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (!groupId.startsWith('20000000')) return sendMessage('Эта команда работает только в беседе.', groupId, {}, userId, null, 'low');
    if (!args[0]) return sendMessage('Использование: "редирект <id беседы>".', groupId, { defaultKeyboard }, userId);

    const cl = classes.find(e => e.groupId == args[0]);

    cl.enableRedirect === true ? cl.enableRedirect = false : cl.enableRedirect = true;

    return sendMessage(`Редирект для ${args[0]} ${cl.enableRedirect ? 'включен' : 'выключен'}`, groupId, { defaultKeyboard }, userId, null, 'low');
  }
};
