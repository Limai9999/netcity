async function ban({vk, classes, args, peerId}) {
  const [groupId, userId] = args;
  const reason = args.slice(2).join(' ') || 'Не указана';

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

  const banData = {
    userId,
    reason,
  };

  const res = await classes.addBannedUser(banData, groupId);

  if (!res) {
    return vk.sendMessage({
      message: `Пользователь ${userId} уже заблокирован.`,
      peerId,
    });
  }

  await vk.sendMessage({
    message: `[id${userId}|Вы] были заблокированы администратором от использования команд, по причине:\n${reason}`,
    peerId: groupId,
  });

  return vk.sendMessage({
    message: `Пользователь ${userId} заблокирован, по причине:\n${reason}`,
    peerId,
  });
}

module.exports = {
  name: 'бан',
  aliases: ['ban'],
  description: 'забанить использование команд пользователю',
  requiredArgs: 2,
  usingInfo: 'Использование: бан [ID группы] [ID пользователя] [причина]',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: false,
  cannotUseWhileSummer: false,
  execute: ban,
};
