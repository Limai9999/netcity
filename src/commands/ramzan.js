function ramzan({vk, peerId}) {
  const awards = [
    'плитка говна',
    'стакан чечни',
    'Украина',
    'Чечня',
    'Чеченская Республика',
    'Чеченский районный центр Чеченской Республики и города Чечня',
    'ничем',
    'приложение Чечня на ваш гандондройд',
  ];

  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const answers = [
    'Здравствуйте',
    'Рамзан не придумал ответа',
    'Чечня не дала ответа',
    'Если это написал Артем Рулетов, то пожалуйста извинись.',
    `Рамзан Кадыров награждает вас: ${random(awards)}`,
    'Рамзан Ахматович Кадыров устал от постоянного отвлекания на вас, поэтому он не отвечает на это.',
    'Артем Рулетов отключись',
  ];

  vk.sendMessage({
    message: random(answers),
    peerId,
    priority: 'low',
  });
}

module.exports = {
  name: 'рамзан',
  aliases: ['ramzan'],
  description: 'тестовая команда',
  requiredArgs: 0,
  usingInfo: 'Использование: рамзан',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  cannotUseWhileSummer: false,
  execute: ramzan,
};
