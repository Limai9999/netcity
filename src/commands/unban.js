async function unban({vk, classes, args, peerId}) {
  const [groupId, userId] = args;

  const checkGroup = await vk.getConversationData(groupId);
  if (checkGroup === false) {
    return vk.sendMessage({
      message: 'Произошла ошибка при поиске группы.',
      peerId,
    });
  }
  if (checkGroup === null) {
    return vk.sendMessage({
      message: 'Группа не найдена.',
      peerId,
    });
  }

  const res = await classes.removeBannedUser(userId, groupId);

  if (!res) {
    return vk.sendMessage({
      message: `Пользователь ${userId} еще не был заблокирован.`,
      peerId,
    });
  }

  await vk.sendMessage({
    message: `[id${userId}|Вы] были разблокированы администратором.`,
    peerId: groupId,
  });

  return vk.sendMessage({
    message: `Пользователь ${userId} разблокирован.`,
    peerId,
  });
}

module.exports = {
  name: 'разбан',
  aliases: ['unban'],
  description: 'разбанить использование команд пользователю',
  requiredArgs: 2,
  usingInfo: 'Использование: разбан [ID группы] [ID пользователя]',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: false,
  cannotUseWhileSummer: false,
  execute: unban,
};
