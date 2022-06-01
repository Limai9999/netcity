function start({vk, peerId}) {
  const message = 'Доброго времени суток! Вы попали на волну всемирной Интернет-паутины данного программного обеспечения (бота), предназначенного для получения школьного расписания и домашнего задания.\n\nДобавьте бота в беседу и используйте команду: "класс" для добавления вашего класса в бота, и обязательно назначьте бота администратором.\n\nМожете также посмотреть, что может данная программа командой: "команды"';
  vk.sendMessage({
    message,
    peerId,
  });
}

module.exports = {
  name: 'начать',
  aliases: ['start'],
  description: 'начать',
  requiredArgs: 0,
  usingInfo: 'Использование: начать',
  isGroupOnly: false,
  isInPMOnly: true,
  isAdminOnly: false,
  isHiddenFromList: true,
  continuteBanned: false,
  showInAdditionalMenu: false,
  cannotUseWhileSummer: false,
  execute: start,
};
