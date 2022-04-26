const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['заметка'],
  description: 'поставить заметку для расписания',
  admin: false,
  async execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    try {
      if (groupId < 2000000000) return sendMessage('К глубочайшему сожалению, данная команда не может быть выполнена в личных сообщениях данной группы посредством социальной сети ВКонтакте.\n\nРаботает только в беседе.', groupId, { defaultKeyboard }, userId, null, 'dontdelete');
      if (!Class) return sendMessage('Класс не найден.\n\nДобавить класс: "класс <имя класса> <логин для сетевого города> <пароль>"\nПароль нужно отправить зашифрованным, получить его можно в лс бота - "шифр <пароль>"', groupId, { defaultKeyboard }, userId, null, 'high');
      if (args[1]) {
        if (!Class.schedule) return sendMessage('Расписание еще не получено. Напиши "рсп" (без номера файла) чтобы его получить.', groupId, { defaultKeyboard }, userId, null, 'low');

        const i = +args[0] - 1;

        if (!Class.schedule[i]) return sendMessage('нету такого расписания!!!', groupId, { defaultKeyboard }, userId, null, 'low');
        if (Class.schedule[i].error) return sendMessage(`Ошибка при получении расписания:\n${Class.schedule[i].error}\n\nПолучить все файлы: рсп все`, groupId, { defaultKeyboard }, userId, null, 'high');

        const filename = Class.schedule[i].result.filename;

        if (args[1] === '0') {
          Class.notes[filename] = null;
          return sendMessage('Заметка удалена.', groupId, { defaultKeyboard }, userId, null, 'medium');
        }

        const note = args.slice(1, args.length).join(' ');

        Class.notes[filename] = note;

        sendMessage('Заметка оставлена.', groupId, { defaultKeyboard }, userId, null, 'medium');
      } else {
        await sendMessage('Правильное использование: заметка <номер расписания> <сама заметка (0, чтобы удалить)>', groupId, { defaultKeyboard }, userId, null, 'high');
      }
    } catch (error) {
      await sendMessage(`вышла ошибочка\n${error}`, groupId, { defaultKeyboard }, userId, null, 'high');
    }
  }
};
