const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['команды'],
  description: 'список команд',
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    const list = vk.commands.map((command, i) => {
      if ((command.admin || command.hidden) && groupId !== config.adminChatId) return;
      return `${i + 1}. ${command.name[0]} - ${command.description} ${command.admin ? '- (admin)' : ''} ${command.hidden ? '- (скрыта)' : ''}`;
    }).filter(e => e);

    const result = `Список команд:\n\n${list.join('\n')}`;

    return sendMessage(result, groupId, { defaultKeyboard }, userId, null, 'low');
  }
};
