const downloadDataFromNetCity = require('./downloadDataFromNetCity');
const parseSchedule = require('./parseSchedule');

const {Keyboard} = require('vk-io');

async function getDataFromNetCity({vk, classes, peerId}) {
  try {
    const {login, password} = await classes.getNetCityData(peerId);
    const className = await classes.getClassName(peerId);

    // Error if no login or password
    if (!login || !password || !className) throw new Error('Не указаны логин, пароль или имя класса.');

    const test = false;
    const distant = false;

    // Settting Already getting data flag
    await classes.setAlreadyGettingData(peerId, true);

    const previousSchedule = await classes.getSchedule(peerId);

    // Cleaning previous schedule and homework
    await classes.cleanSchedule(peerId);
    await classes.cleanHomework(peerId);
    const data = await downloadDataFromNetCity(login, password, distant, test);

    // Break if no data
    if (!data) return false;
    // if (!data.schedule.length) return null;

    // Parsing schedule
    const newSchedule = await Promise.all(data.schedule.map(async (scheduleFile) => {
      const {filename, err, status} = scheduleFile;
      if (!status) return {status, err, filename};

      const schedule = await parseSchedule(filename, className);
      return schedule;
    }));

    // Saving schedule
    await Promise.all(newSchedule.map(async (schedule) => {
      await classes.addSchedule(schedule, peerId);
    }));
    // Saving homework
    await classes.setHomework(data.homework, peerId);
    // Saving last update date
    await classes.setLastDataUpdate(peerId, Date.now());

    // Settting Already getting data flag
    await classes.setAlreadyGettingData(peerId, false);

    // console.log('ps', previousSchedule);
    // console.log('new', newSchedule);

    newSchedule.map(async (New) => {
      const Old = previousSchedule.find((Old) => Old.filename === New.filename);
      if (!Old) return;

      const oldParsed = Old.schedule.join('\n');
      const newParsed = New.schedule.join('\n');

      if (oldParsed === newParsed) return;

      console.log('SCHEDULE CHANGED', New.filename);

      await classes.cleanOldSchedule(peerId);
      await classes.addOldSchedule(Old, peerId);

      const keyboard = Keyboard.builder()
          .textButton({
            label: 'Старое расписание',
            payload: {
              button: 'oldschedule',
              filename: Old.filename,
            },
            color: Keyboard.NEGATIVE_COLOR,
          })
          .row()
          .textButton({
            label: 'Новое расписание',
            payload: {
              button: 'chooseschedule',
              filename: New.filename,
            },
            color: Keyboard.POSITIVE_COLOR,
          })
          .inline();

      const changedList = [];
      if (Old.totalLessons !== New.totalLessons) changedList.push(`количество уроков (было ${Old.totalLessons}, стало ${New.totalLessons})`);
      if (Old.room !== New.room) changedList.push(`кабинет (был ${Old.room}, стал ${New.room})`);
      if (Old.startTime !== New.startTime) changedList.push(`время начала уроков (было ${Old.startTime}, стало ${New.startTime})`);

      const lessonsOld = Old.schedule.map((oldLesson) => {
        return oldLesson.split('-')[2].trim();
      });
      const lessonsNew = New.schedule.map((newlesson) => {
        return newlesson.split('-')[2].trim();
      });

      let check = true;
      lessonsNew.map((newlesson) => {
        if (lessonsOld.find((e) => e === newlesson) || newlesson === '') return;
        changedList.push(`добавлен урок: "${newlesson}"`);
        check = false;
      });
      lessonsOld.map((oldLesson) => {
        if (lessonsNew.find((e) => e === oldLesson) || oldLesson === '') return;
        changedList.push(`убран урок: "${oldLesson}"`);
        check = false;
      });

      for (let i = 0; i < lessonsOld.length; i++) {
        if (lessonsOld[i] === lessonsNew[i]) continue;
        if (check) changedList.push(`изменен урок: "${lessonsOld[i]}" -> "${lessonsNew[i]}"`);
      }

      const result = `@all, Расписание на ${New.date} изменилось.\n\nИзменения:\n${changedList.join('\n')}`;

      await vk.sendMessage({
        message: result,
        peerId,
        keyboard,
        priority: 'high',
      });
    });

    return newSchedule;
  } catch (error) {
    console.log('get data from net city error', error);
    await classes.setAlreadyGettingData(peerId, false);
  }
}

module.exports = getDataFromNetCity;
