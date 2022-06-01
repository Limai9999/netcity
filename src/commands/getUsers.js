const getClassUsers = require('../modules/getClassUsers');

async function getUsers({vk, classes, args, peerId}) {
  const classesWithUsers = await getClassUsers({vk, classes});

  if (!classesWithUsers || !classesWithUsers.length) {
    return vk.sendMessage({
      message: 'Не удалось получить пользователей',
      peerId,
      priority: 'low',
    });
  }

  const result = classesWithUsers.map((classData) => {
    const {classId, totalMembers, members} = classData;

    const membersString = members.map((member) => member.resultString).join('\n');

    const resultString = `${classId}: ${totalMembers} участников:\n\n${membersString}`;
    return resultString;
  });

  vk.sendMessage({
    message: result.join('\n\n'),
    peerId,
    priority: 'low',
  });
}

module.exports = {
  name: 'пользователи',
  aliases: ['getusers'],
  description: 'получить список пользователей',
  requiredArgs: 0,
  usingInfo: 'Использование: пользователи',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  cannotUseWhileSummer: false,
  execute: getUsers,
};
