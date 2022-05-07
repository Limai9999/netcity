const getClassUsers = require('../modules/getClassUsers');

async function getUsers({vk, classes, args, peerId}) {
  const classesWithUsers = await getClassUsers({vk, classes});

  const result = classesWithUsers.map((classData) => {
    const {classId, totalMembers, members} = classData;

    const resultString = `${classId}: ${totalMembers} участников:\n\n${members.resultString.join('\n')}`;
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
  aliases: ['getUsers'],
  description: 'получить список пользователей',
  requiredArgs: 0,
  usingInfo: 'Использование: пользователи',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: true,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  execute: getUsers,
};
