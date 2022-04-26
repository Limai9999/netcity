const sendMessage = require('../utils/sendMessage');

const getUsernames = require('../utils/getUsernames');
const getLastMessages = require('../utils/getLastMessages');

const statistics = require('../data/statistics.json');

module.exports = {
  name: ['статистика'],
  description: 'получить статистику по всем беседам',
  admin: true,
  async execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId < 2000000000) return;
    try {
      const names = await getUsernames(vk, statistics);

      const data = [];

      const msgTotal = 8;

      const getStatsOneGroup = async (group) => {
        const { messages, totalMessages, commandsExecuted, groupId } = group;
        const lastMsgs = getLastMessages(messages, msgTotal, names, true);

        const res = await vk.call('messages.getConversationsById', {
          peer_ids: groupId,
          extended: 1
        });

        const { title, owner_id, members_count } = res.items[0].chat_settings || { title: 'неизв.', owner_id: 'неизв.', members_count: 'неизв.' };
        // const [conversationTitle, totalMembers, ownerId] = [res.items[0].chat_settings.title, res.items[0].chat_settings];

        // console.log(fiveLastMsgs);

        const usernameOwner = names.find(e => e.userId == owner_id) || { name: owner_id };
        const foundClass = classes.find(e => e.groupId === groupId);

        return data.push(`
ID: ${groupId}${groupId >= 2000000000 ? ` - ${groupId - 2000000000}` : ';'} (${title}) ${groupId === config.adminChatId ? '(admin)' : ''}
Класс: ${foundClass ? ` ${foundClass.className}` : '-'}
Создатель: ${usernameOwner.name} - (${owner_id})
Всего участников: ${members_count}
Всего сообщений/сохранено в боте: ${totalMessages}/${messages.length}
Использовано команд кнопками: ${commandsExecuted}

Последние ${msgTotal} сообщений:\n${lastMsgs.join('\n')}
      `);
      };

      await Promise.all(statistics.map(async r => {
        if (!r.groupId.startsWith('2000000') && args[0] !== 'полная') return;
        return await getStatsOneGroup(r);
      }));

      // console.log(data);

      return sendMessage(data.join('\n=========================\n'), groupId, { defaultKeyboard }, userId, null, 'high');
    } catch (error) {
      sendMessage('При получении статистика произошла ошибка.', groupId, { defaultKeyboard }, userId, null, 'high');
      console.log(error);
    }
  }
};
