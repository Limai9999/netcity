const {Keyboard} = require('vk-io');

async function homework({vk, classes, peerId}) {
  const isAlreadyGettingData = await classes.isGettingData(peerId);

  if (isAlreadyGettingData) {
    return vk.sendMessage({
      message: 'Подождите, получение данных уже начато.',
      peerId,
      priority: 'low',
    });
  }

  const homeworkData = await classes.getHomework(peerId);

  if (!homeworkData || !homeworkData.length) {
    return vk.sendMessage({
      message: 'Домашнего задания нет',
      peerId,
      priority: 'low',
    });
  }

  const homeworkMessage = homeworkData.map((homework) => {
    const {date, tasks} = homework;

    const tasksResult = tasks.map((e, index) => {
      const {lesson, task} = e;
      return `${index + 1}. ${lesson} - ${task}`;
    });

    return `${date}:\n${tasksResult.join('\n')}`;
  }).join('\n\n');

  const keyboard = Keyboard.builder()
      .inline()
      .textButton({
        label: 'Получить расписание',
        payload: {
          button: 'getschedule',
        },
        color: Keyboard.POSITIVE_COLOR,
      });

  vk.sendMessage({
    message: homeworkMessage,
    peerId,
    keyboard,
    priority: 'medium',
  });
}

module.exports = {
  name: 'дз',
  aliases: ['gethomework'],
  description: 'получить домашнее задание',
  requiredArgs: 0,
  usingInfo: 'Использование: дз',
  isGroupOnly: false,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  cannotUseWhileSummer: true,
  execute: homework,
};
