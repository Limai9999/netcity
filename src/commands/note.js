async function note({vk, classes, args, peerId}) {
  const scheduleQuery = args[0];
  const noteText = args.slice(1).join(' ');

  const isGettingData = await classes.isGettingData(peerId);

  if (isGettingData) {
    return vk.sendMessage({
      message: 'Подождите, пока расписание загружается, оставить заметку невозможно.',
      peerId,
      priority: 'low',
    });
  }

  const schedules = await classes.getSchedule(peerId);
  const schedule = schedules.find((schedule) => schedule.date === scheduleQuery) || schedules[parseInt(scheduleQuery) - 1];

  if (!schedule) {
    return vk.sendMessage({
      message: 'Не удалось найти расписание.',
      peerId,
      priority: 'low',
    });
  }

  if ((!noteText || noteText.length <= 0) && !schedule.note) {
    return vk.sendMessage({
      message: 'Невозможно удалить заметку, т.к она еще не была оставлена.',
      peerId,
      priority: 'low',
    });
  } else if (!noteText || noteText.length <= 0) {
    schedule.note = null;
    await classes.setSchedule(schedules, peerId);

    return vk.sendMessage({
      message: `Заметка в расписании на ${schedule.date} успешно удалена.`,
      peerId,
      priority: 'low',
    });
  }

  if (noteText.length <= 5) {
    return vk.sendMessage({
      message: 'Текст заметки должен быть больше 5-ти символов.',
      peerId,
      priority: 'low',
    });
  }

  const noteWasAdded = schedule.note ? true : false;
  schedule.note = noteText;

  await classes.setSchedule(schedules, peerId);

  return vk.sendMessage({
    message: `Заметка в расписании на ${schedule.date} успешно ${noteWasAdded ? 'изменена' : 'оставлена'}.`,
    peerId,
    priority: 'medium',
  });
}

module.exports = {
  name: 'заметка',
  aliases: ['note'],
  description: 'оставить заметку в расписании',
  requiredArgs: 1,
  usingInfo: 'Использование: заметка [номер или дата расписания] [текст заметки]. (Чтобы удалить заметку, не указывайте её текст)',
  isGroupOnly: true,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  execute: note,
};
