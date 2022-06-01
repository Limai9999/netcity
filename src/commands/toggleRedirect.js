async function toggleRedirect({vk, classes, args, peerId}) {
  const [groupId] = args;

  const checkGroup = await vk.getConversationData(groupId);
  if (!checkGroup) {
    return vk.sendMessage({
      message: 'Группа не найдена.',
      peerId,
    });
  }

  const res = await classes.toggleRedirect(groupId);
  if (res === null) {
    vk.sendMessage({
      message: 'Беседа не найдена.',
      peerId,
    });
  }

  vk.sendMessage({
    message: `Теперь редирект для беседы ${groupId}: ${res ? 'включен' : 'выключен'}.`,
    peerId,
  });
}


module.exports = {
  name: 'редирект',
  aliases: ['redirect'],
  description: 'включить переадресацию сообщений',
  requiredArgs: 1,
  usingInfo: 'Использование: редирект [номер беседы]',
  isGroupOnly: true,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: false,
  cannotUseWhileSummer: false,
  execute: toggleRedirect,
};
