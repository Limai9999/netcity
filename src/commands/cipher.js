const passwordManager = require('../modules/passwordManager');

async function cipher({vk, args, peerId}) {
  const password = args[0];
  const encryptedPassword = passwordManager('encrypt', password);

  await vk.sendMessage({
    message: 'Это ваш зашифрованный пароль, вставьте его при добавлении класса.',
    peerId,
  });
  return vk.sendMessage({
    message: encryptedPassword,
    peerId,
  });
}

module.exports = {
  name: 'шифр',
  aliases: ['cipher'],
  description: 'зашифровать пароль',
  requiredArgs: 1,
  usingInfo: 'Использование: шифр [пароль]',
  isGroupOnly: false,
  isInPMOnly: true,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: false,
  execute: cipher,
};
