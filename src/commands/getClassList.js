const getClassUsers = require('../modules/getClassUsers');

async function getClassList({vk, classes, statistics, args, peerId}) {
  const groupsModels = await classes.getAllClasses();
  const groups = groupsModels.filter(({id}) => id > 2000000000);

  const usersList = await getClassUsers({vk, classes, type: 'array'});

  const getUserById = (id) => {
    const user = usersList.find((user) => user.id == id);
    if (!user) return {id, name: id, link: `[id${id}|Неизв. имя]`, resultString: 'Неизв.'};
    return user;
  };

  const result = await Promise.all(groups.map(async (group) => {
    const {id, className, isMessagesRedirectEnabled, bannedUsers} = group;
    const {title, members_count, owner_id} = await vk.getConversationData(id) || {};

    const ClassName = className ? `${title}, класс: ${className}` : `${title}`;

    const isRedirect = isMessagesRedirectEnabled ? '🟢' : '🔴';

    const ownerName = getUserById(owner_id).link;

    const bannedUsersList = bannedUsers.map((banData) => getUserById(banData.userId).link);
    const bannedUsersMessage = bannedUsersList.length ? `\nЗаблокированные пользователи: ${bannedUsersList.join(', ')}` : '';
    const bannedUsersCount = bannedUsers.length;

    const totalMessages = await classes.getUserLastSentMessage(id);
    const totalMessagesSaved = (await statistics.getOneGroupStatistics(id)).length;

    const result = `ID: ${id}, Название: ${ClassName}, Количество участников: ${members_count}\nИмя владельца: ${ownerName}\nРедирект сообщений: ${isRedirect}; Заблокировано: ${bannedUsersCount}${bannedUsersMessage}\nВсего сообщений: ${totalMessages}, сохранено: ${totalMessagesSaved}`;

    return result;
  }));

  const resultMessage = result.join('\n\n');

  vk.sendMessage({
    message: resultMessage,
    peerId,
  });
}

module.exports = {
  name: 'группы',
  aliases: ['getgroups'],
  description: 'получить список бесед',
  requiredArgs: 0,
  usingInfo: 'Использование: группы',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  cannotUseWhileSummer: false,
  execute: getClassList,
};
