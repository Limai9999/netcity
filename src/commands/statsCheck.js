const sendMessage = require('../utils/sendMessage');

const getUsernames = require('../utils/getUsernames');

const statistics = require('../data/statistics.json');

module.exports = {
  name: 'статистика',
  description: 'получить статистику по всем беседам',
  admin: true,
  async execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    try {
      if (groupId !== config.adminChatId) return console.log('TRYED USE STATISTICS IN NOT ADMIN CHAT');
      const names = await getUsernames(vk, statistics);

      const data = [];

      const msgTotal = 10;

      const getStatsOneGroup = async (group) => {
        const { messages, totalMessages, commandsExecuted, groupId } = group;
        const fiveLastMsgs = messages.length >= msgTotal ? messages.slice(messages.length - msgTotal, messages.length).map(r => {
          const userId = names.find(e => e.userId === r.userId).name || r.userId;
          return `${userId}: ${r.message} ${r.payload ? `(payload - ${r.payload.button})`: ''}`.trim();
        }) : [`< ${msgTotal} сообщений`];

        const res = await vk.call('messages.getConversationsById', {
          peer_ids: groupId,
          extended: 1
        });

        const { title, owner_id, members_count } = res.items[0].chat_settings;
        // const [conversationTitle, totalMembers, ownerId] = [res.items[0].chat_settings.title, res.items[0].chat_settings];

        // console.log(fiveLastMsgs);

        const usernameOwner = names.find(e => e.userId == owner_id).name || owner_id;
        const foundClass = classes.find(e => e.groupId === groupId);

        return data.push(`
ID: ${groupId} (${title}) ${groupId === config.adminChatId ? '(admin-chat)' : ''}
Класс: ${foundClass ? ` ${foundClass.className}` : 'не добавлен'}
Создатель: ${usernameOwner} - (${owner_id})
Всего участников: ${members_count}
Всего сообщений/сохранено в боте: ${totalMessages}/${messages.length}
Использовано команд кнопками: ${commandsExecuted}

Последние ${msgTotal} сообщений:\n${fiveLastMsgs.join('\n')}
      `);
      };

      await Promise.all(statistics.map(async r => {
        if (!r.groupId.startsWith('2000000')) return;
        return await getStatsOneGroup(r);
      }));

      console.log(data);

      return sendMessage(data.join('\n============================\n'), groupId, { defaultKeyboard }, userId, null, 'high');
    } catch (error) {
      console.log(error);
    }
  }
};
