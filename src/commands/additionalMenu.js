const {Keyboard} = require('vk-io');

async function additionalMenu({vk, peerId, payload}) {
  const commands = vk.getCommands();
  const adminChat = vk.getAdminChat();

  const isAdminChat = peerId == adminChat;

  if (!payload) {
    return vk.sendMessage({
      message: 'Меню открывается только кнопкой.',
      peerId,
      priority: 'low',
    });
  }

  if (payload.menu === 'main') {
    return vk.sendMessage({
      message: 'Открыто обычное меню.',
      peerId,
      keyboard: vk.getDefaultKeyboard(),
      priority: 'low',
      saveKeyboard: true,
    });
  }

  let keyboard = Keyboard.builder();
  keyboard = keyboard.textButton({
    label: 'Обычное меню',
    payload: {button: 'additionalmenu', menu: 'main'},
    color: Keyboard.PRIMARY_COLOR,
  }).row();

  const totalCommands = commands.length;

  commands.map((cmd, index) => {
    const {name, aliases, isAdminOnly, showInAdditionalMenu} = cmd;
    if (!isAdminChat && isAdminOnly) return;
    if (!showInAdditionalMenu) return;

    const color = isAdminOnly ? Keyboard.NEGATIVE_COLOR : Keyboard.POSITIVE_COLOR;

    keyboard = keyboard
        .textButton({
          label: name[0].toUpperCase() + name.slice(1),
          payload: {button: aliases[0]},
          color,
        });

    const checkForRowNum = (totalCommands - index) / 3;
    // check for integer
    if (checkForRowNum % 1 === 0) keyboard = keyboard.row();
  });

  vk.sendMessage({
    message: 'Открыто дополнительное меню.',
    peerId,
    keyboard,
    priority: 'low',
    saveKeyboard: true,
  });
}

module.exports = {
  name: 'допменю',
  aliases: ['additionalmenu'],
  description: 'открыть дополнительное меню',
  requiredArgs: 0,
  usingInfo: 'Использование: допменю',
  isGroupOnly: true,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: true,
  continuteBanned: false,
  showInAdditionalMenu: false,
  execute: additionalMenu,
};
