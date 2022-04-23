const sendMessage = require('../utils/sendMessage');

const startInterval = require('../modules/autoGetSchedule');

module.exports = {
  name: 'класс',
  description: 'добавить/изменить класс',
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (!groupId.startsWith('20000000')) return sendMessage('Эта команда работает только в беседе.', userId, {}, userId, null, 'dontdelete');
    if (!args[0]) return sendMessage('Использование: "класс <имя класса> <логин для Сетевого Города> <пароль>"\nЕсли класс уже был добавлен, то нужно просто "класс <имя класса>".\n\nПароль можно зашифровать в лс бота - "шифр <пароль>"', groupId, { defaultKeyboard }, userId, null, 'medium');

    const phrases = [
      `Не кажется ли тебе, что класс ${args[0]} является несуществующим?`,
      `Мне кажется, что класс ${args[0]} не существует.`,
      `Слишком много букв либо цифр в классе ${args[0]}.`,
      `Класса ${args[0]} не существует.`,
      'Извинись и введи нормальный класс.'
    ];

    if (!Class) {
      if (!args[2]) return sendMessage('Не введены логин и пароль для Cетевого Города.', groupId, { defaultKeyboard }, userId, null, 'low');
      if (args[0].length > 2) return sendMessage(phrases[Math.floor(Math.random() * phrases.length)], groupId, { defaultKeyboard }, userId, null, 'low');

      classes.push({
        groupId,
        className: args[0],
        notes: {},
        homework: null,
        lastUpdate: null,
        schedule: null,
        oldSchedule: [],
        scheduleType: 'default',
        alreadyGetting: false,
        timeoutStarted: false,
        username: args[1],
        password: args[2],
        lastSeenSchedule: null
      });

      startInterval(groupId, classes);
      return sendMessage(`Класс ${args[0]} добавлен.`, groupId, { defaultKeyboard }, userId, null, 'high');
    } else {
      if (args[0].length > 2 || args[0].length < 2) return sendMessage(phrases[Math.floor(Math.random() * phrases.length)], groupId, { defaultKeyboard }, userId, null, 'high');
      Class.className = args[0];

      if (args[2]) {
        Class.username = args[1];
        Class.password = args[2];
      }
      // else if (args[2] && userId !== '357833595') {
      //   return sendMessage('К сожалению, тебе не разрешено менять логин и пароль от Сетевой Вселенной.', groupId, { defaultKeyboard }, userId, null, 'medium');
      // }

      return sendMessage(`Класс изменен на ${args[0]}.`, groupId, { defaultKeyboard }, userId, null, 'high');
    }
  }
};
