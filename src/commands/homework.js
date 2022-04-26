const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['дз', 'gethomework'],
  description: 'получить домашнее задание',
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId < 2000000000) return sendMessage('Эта команда работает только в беседе.', userId, {}, userId, null, 'dontdelete');

    const homework = Class.homework;

    if (!homework) return sendMessage('Сначала нужно получить расписание.', groupId, { defaultKeyboard }, userId, null, 'medium');
    if (!homework.length) return sendMessage('Домашнего задания нет.', groupId, { defaultKeyboard }, userId, null, 'medium');

    const homeworkMessage = `Домашнее задание для ${Class.className}:\n\n` + homework.map(e => {
      const tasks = e.tasks.map((r, i) => {
        return `${i + 1}. ${r.lesson}: ${r.task}`;
      });

      return `${e.date}:\n${tasks.join('\n')}`;
    }).join('\n\n');

    let keyboard = defaultKeyboard;
    keyboard.inline = true;
    keyboard = JSON.stringify(keyboard);
    defaultKeyboard.inline = false;

    return sendMessage(homeworkMessage, groupId, { keyboard }, userId, null, 'medium');
  }
};
