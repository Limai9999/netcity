async function note({vk, classes, args, peerId}) {
  const scheduleQuery = args[0];
  let noteText = args.slice(1).join(' ');

  if (args[0] === 'главная') {
    let isDelete = false;

    console.log(noteText);

    if (!noteText || noteText.length <= 0) {
      noteText = null;
      isDelete = true;
    }

    await classes.setMainNote(noteText, peerId);

    return vk.sendMessage({
      message: `Главная заметка успешно ${isDelete ? 'удалена' : 'обновлена'}.`,
      peerId,
      priority: 'low',
    });
  }

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

  const notes = await classes.getScheduleNotes(peerId);

  if (!schedule) {
    return vk.sendMessage({
      message: 'Не удалось найти расписание.',
      peerId,
      priority: 'low',
    });
  }

  if ((!noteText || noteText.length <= 0) && !notes[schedule.date]) {
    return vk.sendMessage({
      message: 'Невозможно удалить заметку, т.к она еще не была оставлена.',
      peerId,
      priority: 'low',
    });
  } else if (!noteText || noteText.length <= 0) {
    notes[schedule.date] = null;
    await classes.setScheduleNotes(notes, peerId);

    return vk.sendMessage({
      message: `Заметка в расписании на ${schedule.date} успешно удалена.`,
      peerId,
      priority: 'low',
    });
  }

  const noteWasAdded = notes[schedule.date] ? true : false;
  notes[schedule.date] = noteText;
  await classes.setScheduleNotes(notes, peerId);

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
  usingInfo: 'Использование: заметка [номер или дата расписания | главная] [текст заметки]. (Чтобы удалить заметку, не указывайте её текст)',
  isGroupOnly: true,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  cannotUseWhileSummer: false,
  execute: note,
};
