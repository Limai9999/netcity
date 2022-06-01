async function removeMessage({vk, classes, args, peerId}) {
  const [groupId, messageId] = args;

  const checkGroup = await vk.getConversationData(groupId);
  if (!checkGroup) {
    return vk.sendMessage({
      message: 'Группа не найдена.',
      peerId,
    });
  }

  // remove message from group
  const removeResult = await vk.removeMessage({
    messageId,
    peerId: groupId,
    type: 'user',
  });

  if (!removeResult) {
    return vk.sendMessage({
      message: 'Не удалось удалить сообщение/',
      peerId,
    });
  }

  // send message to executor group as result
  await vk.sendMessage({
    message: `Сообщение №${messageId} в беседе ${groupId} удалено.`,
    peerId,
    type: 'user',
  });
}

module.exports = {
  name: 'удалить',
  aliases: ['removemsg'],
  description: 'удалить сообщение в беседе',
  requiredArgs: 2,
  usingInfo: 'Использование: удалить [ID группы] [ID сообщения]',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: false,
  cannotUseWhileSummer: false,
  execute: removeMessage,
};
