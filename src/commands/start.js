const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: 'начать',
  description: 'начать (хуита при открытии бота первый раз)',
  hidden: true,
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    if (groupId > 2000000000) return;
    return sendMessage('Здравствуйте! Вы попали на волну интернет-трафика данного программного обеспечения (бота), предназначенного для получения школьного расписания.\n\nДобавьте бота в беседу и используйте команду: "класс" для добавления вашего класса в бота.\n\nМожете также посмотреть, что может данная программа командой: "команды"', userId, { defaultKeyboard }, userId, null, 'dontdelete');
  }
};
