async function manageClass({vk, classes, args, peerId}) {
  const [className, login, password] = args;

  if (className.length > 2) {
    return vk.sendMessage({
      message: 'Название класса не должно быть больше 2-х символов.',
      peerId,
      priority: 'low',
    });
  }

  const ncData = await classes.getNetCityData(peerId);

  if (!login || !password) {
    if (!ncData.login && !ncData.password) {
      return vk.sendMessage({
        message: 'Вы не ввели логин или пароль.',
        peerId,
        priority: 'low',
      });
    }
  } else {
    if (login.length < 5) {
      return vk.sendMessage({
        message: 'Логин не должен быть меньше 5-ти символов.',
        peerId,
        priority: 'low',
      });
    }
    if (password.length < 20) {
      return vk.sendMessage({
        message: 'Пароль должен быть зашифрованным. Используйте команду "шифр".',
        peerId,
        priority: 'low',
      });
    }

    await classes.setNetCityData(peerId, {
      login,
      password,
    });
    await classes.setClassName(className, peerId);

    return vk.sendMessage({
      message: `Класс ${className} успешно добавлен.`,
      peerId,
    });
  }

  await classes.setClassName(className, peerId);
  return vk.sendMessage({
    message: `Класс успешно изменен на ${className}.`,
    peerId,
  });
};

module.exports = {
  name: 'класс',
  aliases: ['manageclass'],
  description: 'добавить/изменить класс',
  requiredArgs: 1,
  usingInfo: 'Использование: класс [номер и буква класса] [логин] [пароль] (от Сетевой Страны, необязательно)',
  isGroupOnly: true,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  execute: manageClass,
};
