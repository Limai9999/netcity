const sendMessage = require('../utils/sendMessage');

const getUsernames = require('../utils/getUsernames');
const getLastMessages = require('../utils/getLastMessages');

const statistics = require('../data/statistics.json');

module.exports = {
  name: ['сообщения'],
  description: 'получить последние сообщения в беседе',
  admin: true,
  async execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId < 2000000000) return;
    if (!args[0]) return sendMessage('Использование: "сообщения <ID беседы> <кол-во сообщений> <показывать payload? да/нет>".', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

    const id = parseInt(args[0]);
    const chatId = id <= 2000000000 ? id + 2000000000 : id;

    // console.log(chatId);

    const group = statistics.find(e => e.groupId == chatId);
    if (!group) return sendMessage('Беседа не найдена.', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

    const count = args[1] || 10;
    const payload = args[2] === 'да' ? true : false;

    const usernames = await getUsernames(vk, statistics);
    if (!usernames) return sendMessage('Не удалось получить имена пользователей.', groupId, { defaultKeyboard }, userId, null, 'dontdelete');
    const lastMessages = getLastMessages(group.messages, count, usernames, payload);
    if (!lastMessages) return sendMessage('Не удалось получить последние сообщения.', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

    if (lastMessages.length > 50) return sendMessage('Слишком много сообщений.', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

    const result = `Последние ${lastMessages.length} сообщений в беседе ${chatId}:\n\n${lastMessages.join('\n')}`;
    return sendMessage(result, groupId, { defaultKeyboard }, userId, null, 'dontdelete');
  }
};
