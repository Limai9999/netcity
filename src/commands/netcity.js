async function setNetCity({vk, classes, args, peerId}) {
  const [username, password] = args;
  if (username.length < 5 || password.length < 5) {
    return vk.sendMessage({
      message: 'Логин и пароль должны быть не менее 5-ти символов.',
      peerId,
      priority: 'low',
    });
  }

  await classes.setNetCityData(peerId, {username, password});
  return vk.sendMessage({
    message: `Данные успешно сохранены.\n\nЛогин: ${username}\nПароль: ${password}`,
    peerId,
  });
};

module.exports = {
  name: 'сетевой',
  aliases: ['setnetcitydata'],
  description: 'изменить данные для Сетевой Инстанции',
  requiredArgs: 2,
  usingInfo: 'Использование: сетевой [логин] [пароль]',
  isGroupOnly: false,
  isInPMOnly: true,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  execute: setNetCity,
};
