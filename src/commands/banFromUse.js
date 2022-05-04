const sendMessage = require('../utils/sendMessage');

function banFromUse(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
  if (!args[1]) return sendMessage('Использование: <id группы> <id участника> <unban?>', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

  const groupIdToBan = args[0];
  const userIdToBan = args[1];

  // get reason from args2
  const reason = args.slice(2).join(' ') || 'Не указана';

  const isUnban = args[2] === ('unban' || 'разбан');

  const group = classes.find(item => item.groupId === groupIdToBan);
  if (!group) return sendMessage('Группа не найдена', groupId, { defaultKeyboard }, userId, null, 'dontdelete');

  if (isUnban) {
    group.bannedUsers = group.bannedUsers.filter(item => item.userId !== userIdToBan);
    return sendMessage(`Пользователь разбанен`, groupId, { defaultKeyboard }, userId, null, 'dontdelete');
  } else {
    // check if already banned
    if (group.bannedUsers.find(item => item.userId === userIdToBan)) return sendMessage(`Пользователь уже забанен`, groupId, { defaultKeyboard }, userId, null, 'dontdelete');
    group.bannedUsers.push({ userId: userIdToBan, reason });
    return sendMessage(`Пользователь успешно запломбирован.\nПричина: ${reason}`, groupId, { defaultKeyboard }, userId, null, 'dontdelete');
  }
}

module.exports = {
  name: ['бан', 'запретить', 'banFromUse'],
  description: 'запретить использовать команды',
  admin: true,
  execute: banFromUse
};
