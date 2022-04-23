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

  if (!all) {
    filenames = await getScheduleFiles(Class.username, Class.password, distant, test);
  }

  if (!filenames) {
    Class.lastUpdate = Date.now();
    return false;
  }

  const previousUpdate = Class.lastUpdate;
  Class.lastUpdate = Date.now();

  if (all) {
    const fn = readdirSync('./src/files');

    fn.map(r => {
      // if (filenames[0].find(e => e.filename === r)) return;
      filenames[0].push({ status: true, filename: r });
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

        if (!r.status) return false;
        if (r.result.schedule.join('\n') !== Class.schedule[index].result.schedule.join('\n')) {
          try {
            console.log('SCHEDULE CHANGED', index);
            Class.notes[r.filename] = null;

            const oldSchedule = Class.schedule[index];
            const oldIndex = Class.oldSchedule.push(oldSchedule);

            Class.oldSchedule[oldIndex - 1].result.old = true;
            Class.oldSchedule[oldIndex - 1].result.lastUpdate = previousUpdate;

            const keyboard = JSON.stringify({
              buttons: [
                [
                  { action: { type: 'text', label: 'Старое расписание', payload: `{"button":"oldschedule-${oldIndex}"}` }, color: 'negative' },
                  { action: { type: 'text', label: 'Новое расписание', payload: `{"button":"schedule-${indexNew + 1}"}` }, color: 'positive' },
                ]
              ],
              inline: true,
              one_time: false
            });

            sendMessage(`Расписание на ${Class.schedule[index].result.date} изменилось.`, Class.groupId, { keyboard }, null, null, 'dontdelete');
          } catch (error) {
            console.log(error);
            sendMessage(`Какое-то расписание изменилось, но к глубочайшему сожалению вышла ошибка при уведомлении об этом.\n\nОшибка: ${error}`, Class.groupId, { defaultKeyboard }, null, null, 'dontdelete');
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
    return result;
  }

  return result;
};
