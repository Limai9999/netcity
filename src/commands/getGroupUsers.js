const sendMessage = require('../utils/sendMessage');

const statistics = require('../data/statistics.json');

const getUsernames = require('../utils/getUsernames');

async function getGroupUsers(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
  if (groupId !== config.adminChatId) return;

  const usernames = await getUsernames(vk, statistics);

  const arrayOfUsers = {};
  for (let i = 0; i < usernames.length; i++) {
    if (!arrayOfUsers[usernames[i].groupId]) {
      arrayOfUsers[usernames[i].groupId] = [];
    }
    arrayOfUsers[usernames[i].groupId].push({ username: usernames[i].name, userId: usernames[i].userId });
  }

  // for each ArrayOfUsers object return string with users and their ids
  const arrayOfUsersString = [];
  const keys = Object.keys(arrayOfUsers);
  for (let i = 0; i < keys.length; i++) {
    arrayOfUsersString.push(`${keys[i]}:\n${arrayOfUsers[keys[i]].map(user => `${user.userId}: ${user.username}`).join('\n')}`);
  }

  return sendMessage(arrayOfUsersString.join('\n\n'), groupId, { defaultKeyboard }, userId, null, 'dontdelete');
}

module.exports = {
  name: ['пользователи', 'челики', 'чудики', 'участники', 'getUsers'],
  description: 'получить всех участников беседы',
  admin: true,
  execute: getGroupUsers
};
