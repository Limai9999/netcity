function commandsList({vk, peerId}) {
  const commands = vk.getCommands();

  const isAdminChat = peerId == vk.getAdminChat();

  const commandsList = commands.map((cmd) => {
    let {name, aliases, description, isGroupOnly, isInPMOnly, isAdminOnly, isHiddenFromList} = cmd;
    const isGroup = (isGroupOnly) ? '✅' : '❌';
    const isPM = (isInPMOnly) ? '✅' : '❌';
    const isAdmin = (isAdminOnly) ? '✅' : '❌';
    const isHidden = (isHiddenFromList) ? '✅' : '❌';

    if (!isAdminChat && isAdminOnly) return false;
    if (isHiddenFromList && !isAdminChat) return false;

    const additionalInfo = isAdminChat ? `\n${isGroup}-${isPM}-${isAdmin};${isHidden}\n` : '';

    canShowAliases = aliases.length > 0 && isAdminChat;
    aliases = canShowAliases ? ` (${aliases.filter((alias) => alias !== name).join(', ')})` : '';

    return `${name}${aliases} - ${description}${additionalInfo}`;
  }).filter((cmd) => cmd).join('\n');

  const additionalInfo = isAdminChat ? '\n\nЭмоции - только в: Группе, ЛС, Админ-чате; Скрыта' : '';

  const message = `Список команд:\n${commandsList}${additionalInfo}`;

  vk.sendMessage({
    message,
    peerId,
    priority: 'low',
  });
}

module.exports = {
  name: 'команды',
  aliases: ['cmdlist'],
  description: 'получить список команд',
  requiredArgs: 0,
  usingInfo: 'Использование: команды',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  cannotUseWhileSummer: false,
  execute: commandsList,
};
