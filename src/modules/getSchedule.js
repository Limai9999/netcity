const getScheduleFiles = require('./getScheduleFiles');
const parseSchedule = require('./parseSchedule');
const timeoutToCleanSchedule = require('./timeoutToCleanSchedule');

const sendMessage = require('../utils/sendMessage');

const { readdirSync } = require('fs');

const { defaultKeyboard } = require('../data/config.json');

module.exports = async (groupId, classes, all = false, automatic = true) => {
  const Class = classes.find(e => e.groupId === groupId);
  const test = false;
  const distant = false;

  if (!automatic) {
    Class.lastSeenSchedule = null;
  }

  let filenames = [[]];

  if (!all) filenames = await getScheduleFiles(Class.username, Class.password, distant, test);

  if (!filenames) {
    Class.lastUpdate = Date.now();
    return false;
  }

  const previousUpdate = Class.lastUpdate;
  Class.lastUpdate = Date.now();

  if (all) {
    const fn = readdirSync('./src/files');

    fn.map(filename => {
      if (!filename.endsWith('.xlsx')) return console.log('not xlsx file');
      // if (filenames[0].find(e => e.filename === r)) return;
      filenames[0].push({ status: true, filename });
    });

    timeoutToCleanSchedule(groupId, classes);
  }

  // console.log(filenames);

  // console.log(filenames, 'sched');

  const scheduleFiles = await Promise.all(filenames.map(async r => {
    return await Promise.all(r.map(async data => {
      if (!data.status) {
        return {
          status: false,
          filename: data.filename,
          error: data.err
        };
      }

      let result = {};

      if (!data.distant) {
        result = await parseSchedule(data.filename, Class.className);
      } else {
        result = data.result;
      }

      if (result.error) {
        return {
          status: false,
          filename: data.filename,
          error: result.error
        };
      }

      return {
        status: true,
        filename: data.filename,
        result
      };
    }));
  }));

  const result = [];

  scheduleFiles.map(r => {
    r.map(r => {
      result.push(r);
    });
  });

  // console.log(result, 'result end');

  try {
    result.map(r => {
      if (r.result.distant) return;
      // console.log(Class.schedule);
      // console.log(result, 'result 1');

      if (Class.schedule && result && !all && Class.schedule.length > 0) {
        const index = Class.schedule.findIndex(e => e.filename === r.filename);
        const indexNew = result.findIndex(e => e.filename === r.filename);
        // console.log('sched changed first if');

        const schedule = Class.schedule[index];

        if (!r.status) return false;
        if (r.result.schedule.join('\n') !== schedule.result.schedule.join('\n')) {
          try {
            console.log('SCHEDULE CHANGED', index);
            Class.notes[r.filename] = null;

            const oldSchedule = schedule;
            const oldIndex = Class.oldSchedule.push(oldSchedule);

            Class.oldSchedule[oldIndex - 1].result.old = true;
            Class.oldSchedule[oldIndex - 1].result.lastUpdate = previousUpdate;

            const keyboard = JSON.stringify({
              buttons: [
                [
                  { action: { type: 'text', label: 'Старое расписание', payload: JSON.stringify({ button: 'chooseoldschedule', schedule: oldIndex }) }, color: 'negative' },
                  { action: { type: 'text', label: 'Новое расписание', payload: JSON.stringify({ button: 'chooseschedule', schedule: indexNew + 1 }) }, color: 'positive' },
                ]
              ],
              inline: true,
              one_time: false
            });

            // console.log('schedule,', schedule);
            // console.log('newsched', r);

            const changedList = [];
            if (schedule.result.totalLessons !== r.result.totalLessons) changedList.push(`количество уроков (было ${schedule.result.totalLessons}, стало ${r.result.totalLessons})`);
            if (schedule.result.room !== r.result.room) changedList.push(`кабинет (был ${schedule.result.room}, стал ${r.result.room})`);
            if (schedule.result.startTime !== r.result.startTime) changedList.push(`время начала уроков (было ${schedule.result.startTime}, стало ${r.result.startTime})`);

            const lessonsOld = schedule.result.schedule.map(oldLesson => {
              return oldLesson.split('-')[2].trim();
            });
            const lessonsNew = r.result.schedule.map(newlesson => {
              return newlesson.split('-')[2].trim();
            });

            let check = true;

            lessonsNew.map(lesson => {
              if (lessonsOld.find(e => e === lesson) || lesson === '') return;
              changedList.push(`добавлен урок: "${lesson}"`);
              check = false;
            });
            lessonsOld.map(lesson => {
              if (lessonsNew.find(e => e === lesson) || lesson === '') return;
              changedList.push(`убран урок: "${lesson}"`);
              check = false;
            });

            // console.log('old', lessonsOld);
            // console.log('new', lessonsNew);

            for (let i = 0; i < lessonsOld.length; i++) {
              if (lessonsOld[i] === lessonsNew[i]) continue;
              if (check) changedList.push(`изменен урок: "${lessonsOld[i]}" -> "${lessonsNew[i]}"`);
            }

            const response = `Расписание на ${schedule.result.date} изменилось.\n\nИзменения:\n${changedList.join('\n')}`;

            sendMessage(response, Class.groupId, { keyboard }, null, null, 'dontdelete');
          } catch (error) {
            console.log(error);
            sendMessage(`Какое-то расписание изменилось, но к глубочайшему сожалению вышла ошибка при уведомлении об этом.\n\nОшибка: ${error}`, Class.groupId, { defaultKeyboard }, null, null, 'dontdelete');
          }
        }
      }
    });
  } catch (error) {
    console.log('getschedule', error);
    return result;
  }

  return result;
};
