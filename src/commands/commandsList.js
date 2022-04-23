const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: 'команды',
  description: 'список команд',
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    const list = Array.from(vk.collection).map((r, i) => {
      const [, command] = r;
      if (command.admin && groupId !== config.adminChatId) return;
      return `${i + 1}. ${command.name} - ${command.description} ${command.admin ? '- (admin chat only)' : ''}`;
    }).filter(e => e);

    const result = `Список команд:\n\n${list.join('\n')}`;

    return sendMessage(result, groupId, { defaultKeyboard }, userId, null, 'low');
  }
};
