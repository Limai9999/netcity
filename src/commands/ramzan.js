const sendMessage = require('../utils/sendMessage');

module.exports = {
  name: ['рамзан'],
  description: 'тест-команда',
  admin: false,
  execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard) {
    const awards = [
      'плитка говна',
      'стакан чечни',
      'Украина',
      'Чечня',
      'Чеченская Республика',
      'Чеченский районный центр Чеченской Республики и города Чечня',
      'ничем',
      'приложение Чечня на ваш гандондройд'
    ];

    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const answers = [
      'Здравствуйте',
      'Рамзан не придумал ответа',
      'Чечня не дала ответа',
      'Если это написал Артем Рулетов, то пожалуйста извинись.',
      `Рамзан Кадыров награждает вас: ${random(awards)}`,
      'Рамзан Ахматович Кадыров устал от постоянного отвлекания на вас, поэтому он не отвечает на это.',
      'Артем Рулетов отключись'
    ];

    return sendMessage(random(answers), groupId, { defaultKeyboard }, userId, null, 'low');
  }
};
