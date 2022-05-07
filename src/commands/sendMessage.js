async function sendMessage({vk, classes, args, peerId}) {
  const [groupId] = args;

  const message = args.slice(1).join(' ');

  const checkGroup = await vk.getConversationData(groupId);
  if (!checkGroup) {
    return vk.sendMessage({
      message: 'Группа не найдена.',
      peerId,
    });
  }

  // send message to group
  const sentMsgId = await vk.sendMessage({
    message,
    peerId: groupId,
    type: 'user',
  });

  // send message to executor group as result
  await vk.sendMessage({
    message: `Сообщение в беседу ${groupId} отправлено. ID: ${sentMsgId}`,
    peerId,
    type: 'user',
  });
}

module.exports = {
  name: 'сообщение',
  aliases: ['msg'],
  description: 'отправить сообщение в беседу',
  requiredArgs: 2,
  usingInfo: 'Использование: сообщение [ID группы] <сообщение>',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: false,
  execute: sendMessage,
};
