const sendMessage = require('../utils/sendMessage');

const moment = require('moment');

const getSchedule = require('../modules/getSchedule');

module.exports = {
  name: ['рсп', 'getschedule', 'updateschedule', 'allschedule', 'chooseoldschedule', 'chooseschedule'],
  description: 'получить расписание уроков',
  admin: false,
  async execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard, payload) {
    if (groupId < 2000000000) return sendMessage('К глубочайшему сожалению, данная команда не может быть выполнена в личных сообщениях данной группы посредством социальной сети ВКонтакте.\n\nРаботает только в беседе.', groupId, {}, userId, null, 'dontdelete');
    if (!Class) return sendMessage('Класс не найден.\n\nДобавить: "класс <имя класса> <логин для сетевого города> <пароль>"\nПароль можно зашифровать в лс бота - "шифр <пароль>"', groupId, { defaultKeyboard }, userId, null, 'medium');

    const todayDate = [
      moment().format('DD.MM'),
      moment().format('D.MM')
    ];

    if (payload) {
      if (payload.button === 'chooseschedule') args[0] = payload.schedule;
      // if (payload.button === 'allschedule') args[0] = 'все';
      if (payload.button === 'updateschedule') args[0] = '0';
      if (payload.button === 'chooseoldschedule') {
        args[0] = 'старое';
        args[1] = payload.schedule;
      }
    }

    if (args[0] && args[0] !== '0' && args[0] !== 'дистант' && args[0] !== 'старое') {
      if (!Class.schedule) return sendMessage('Расписание еще не получено. Напиши "рсп" (без номера файла) чтобы его получить.', groupId, { defaultKeyboard }, userId, null, 'low');
      try {
        const i = +args[0] - 1;
        if (!Class.schedule[i]) return sendMessage('нету такого расписания!!!', groupId, { defaultKeyboard }, userId, null, 'low');
        if (Class.schedule[i].error) return sendMessage(`Ошибка при получении расписания:\n${Class.schedule[i].error}`, groupId, { defaultKeyboard }, userId, null, 'high');
        await sendMessage(`Расписание на ${Class.schedule[i].result.date} (${moment(Class.lastUpdate).locale('ru').format('HH:mm')}) для ${Class.className}.\n\nВсего уроков: ${Class.schedule[i].result.totalLessons}, начинаются в ${Class.schedule[i].result.startTime}${Class.schedule[i].result.room ? `, каб. ${Class.schedule[i].result.room}` : ''}.${Class.notes[Class.schedule[i].result.filename] ? `${`\n\nЗаметка: ${Class.notes[Class.schedule[i].result.filename]} ⚠️`}` : ''}\n\n\n${Class.schedule[i].result.schedule.join('\n')}${Class.schedule[i].result.distant ? '\n\nЭто расписание взято не из объявлений, а из самого сетевого города.' : ''}`, groupId, { defaultKeyboard }, userId, null, 'medium');

        // if (LSSTimeout.timeout) {
        //   clearTimeout(LSSTimeout.timeout);
        // }
        // LSSTimeout.timeout = setTimeout(() => {
        //   LSSTimeout.timeout = null;
        //   Class.lastSeenSchedule = null;
        // }, 900000);

        // if (Class.lastSeenSchedule === Class.schedule[i].result.date) {
        //   const random = randomInterval(0, 2);
        //   console.log(random);
        //   if (!random) {
        //     // const random2 = randomInterval(0, 2);
        //     sendMessage(`[groupId${userId}|Получатель расписания], а вы вообще представляли себе, что в боте есть функция оповещения при изменении расписания (!!!!!), и не обязательно каждые 5 минут открывать одно и тоже расписание в надежде что оно изменилось, когда пролистав чуть выше можно найти то же самое расписание. Расписание обновляется каждые 15 минут автоматически.`, groupId, { defaultKeyboard }, userId, null, 'medium');
        //     // if (!random2) {
        //     //   setTimeout(() => {
        //     //     sendMessage(`Хочется донести очень полезную мысль до вашего головного мозга, что подобная халатность приводит к засорению беседы, хоть сообщения и удаляются, они же типа не сразу удаляются ну и вот - неприятно када заходишь и тысяча получений расписаний. У меня всё.`, groupId, { defaultKeyboard }, userId, null, 'medium');
        //     //   }, 1500);
        //     // }
        //   }
        // }

        Class.lastSeenSchedule = Class.schedule[i].result.date;
        return;
      } catch (error) {
        let keyboard = defaultKeyboard;
        keyboard.inline = true;
        keyboard = JSON.stringify(keyboard);
        defaultKeyboard.inline = false;

        await sendMessage(`вышла ошибочка\n${error}`, groupId, { keyboard }, userId, null, 'high');
        return console.log(error);
      }
    } else if (args[0] === 'старое') {
      if (!Class.schedule) return sendMessage('Расписание еще не получено. Напиши "рсп" (без номера файла) чтобы его получить.', groupId, { defaultKeyboard }, userId, null, 'low');
      try {
        const i = +args[1] - 1;
        if (!Class.oldSchedule[i]) return sendMessage('нету такого расписания!!!', groupId, { defaultKeyboard }, userId, null, 'low');
        if (Class.oldSchedule[i].error) return sendMessage(`Ошибка при получении расписания:\n${Class.oldSchedule[i].error}`, groupId, { defaultKeyboard }, userId, null, 'high');
        await sendMessage(`Неактуальное расписание на ${Class.oldSchedule[i].result.date} (${moment(Class.oldSchedule[i].result.lastUpdate).locale('ru').format('HH:mm')}) для ${Class.className}.\n\nВсего уроков: ${Class.oldSchedule[i].result.totalLessons}, начинаются в ${Class.oldSchedule[i].result.startTime}${Class.oldSchedule[i].result.room ? `, каб. ${Class.oldSchedule[i].result.room}` : ''}.${Class.notes[Class.oldSchedule[i].result.filename] ? `${`\n\nЗаметка: ${Class.notes[Class.oldSchedule[i].result.filename]} ⚠️`}` : ''}\n\n\n${Class.oldSchedule[i].result.schedule.join('\n')}${Class.oldSchedule[i].result.distant ? '\n\nЭто расписание взято не из объявлений, а из самого сетевого города.' : ''}`, groupId, { defaultKeyboard }, userId, null, 'medium');
        return;
      } catch (error) {
        let keyboard = defaultKeyboard;
        keyboard.inline = true;
        keyboard = JSON.stringify(keyboard);
        defaultKeyboard.inline = false;

        await sendMessage(`вышла ошибочка\n${error}`, groupId, { keyboard }, userId, null, 'high');
        return console.log(error);
      }
    }
    if (Class.alreadyGetting) {
      return sendMessage('Бот уже ищет расписание, надо немного подождать', groupId, { defaultKeyboard }, userId, null, 'low');
    }
    if (!Class.schedule || args[0] === '0' || args[0] === 'дистант') {
      sendMessage('прошу немного подождать', groupId, { defaultKeyboard }, userId, null, 'low');
    }

    try {
      Class.alreadyGetting = true;

      let distant = false;

      if (args[0] === 'дистант') distant = true;

      if (distant) {
        Class.schedule = Class.schedule && Class.scheduleType === 'distant' ? Class.schedule : (await getSchedule(groupId, classes, false, distant, false, false)).statuses;
      } else {
        // Class.schedule = args[0] === 'все' ? (await getSchedule(groupId, classes, true, false, false, false)).statuses :
        Class.schedule = !Class.schedule || args[0] === '0' ? (await getSchedule(groupId, classes, false, false, false, false)).statuses : Class.schedule;
      }

      // console.log(Class.schedule);

      Class.alreadyGetting = false;

      // console.log('teeeest', Class.schedule);

      if (Class.schedule.length === 0) {
        let keyboard = defaultKeyboard;
        keyboard.inline = true;
        keyboard = JSON.stringify(keyboard);
        defaultKeyboard.inline = false;

        Class.schedule = null;
        return sendMessage('Расписания в сетевом нет либо произошла какая-то ошибка.', groupId, { keyboard }, userId, null, 'high');
      } else if (!Class.schedule) {
        let keyboard = defaultKeyboard;
        keyboard.inline = true;
        keyboard = JSON.stringify(keyboard);
        defaultKeyboard.inline = false;

        Class.schedule = null;
        return sendMessage('вышла ошибочка сетевово горада либо кадыров дибил', groupId, { keyboard }, userId, null, 'high');
      }

      let keyboard = {
        buttons: [
          [],
          [
            { action: { type: 'text', label: 'Домашнее задание', payload: JSON.stringify({ button: 'gethomework' }) }, color: 'positive' },
            // { action: { type: 'text', label: 'Расп. (дистант)', payload: '{"button":"getschedule_dist"}' }, color: 'positive' },
          ],
          [
            { action: { type: 'text', label: 'Обновить расписание', payload: JSON.stringify({ button: 'updateschedule' }) }, color: 'negative' }
          ]
        ],
        inline: true
      };

      let additionallString = '';

      // console.log(Class.schedule, 'Class.schedule');

      // const filenameToChange = filenames.findIndex(e => e.endsWith(todayDate));

      let todayScheduleIsHave = false;

      let distFirstWas = false;

      let filenames = await Promise.all(Class.schedule.map((r, i) => {
        if (r.old) return false;
        keyboard.buttons[0].push({ action: { type: 'text', label: i + 1, payload: JSON.stringify({ button: 'chooseschedule', schedule: i + 1 }) }, color: 'secondary' });
        let result = `${i + 1} - ${r.filename}`.replace('.xlsx', '');

        if (!r.result || r.error) result += ' ⚠️';

        if (r.result || !r.error) {
          if (todayDate.includes(r.result.date)) {
            result += ' ✅';
            todayScheduleIsHave = true;
          }
        } else {
          if (todayDate.includes(r.filename.replace('.xlsx', ''))) {
            result += ' ✅';
            todayScheduleIsHave = true;
          }
        }

        if (!distFirstWas && r.result && r.result.distant) {
          distFirstWas = true;
          return `\n\nДистант:\n${result}`;
        }

        return result;
      }));

      // console.log(filenames);

      filenames = filenames.filter(e => e);

      filenames.map((r, i) => {
        filenames[i] = filenames[i].replace('.xlsx', '');
      });

      if (!todayScheduleIsHave) additionallString += ' - Расписания на сегодня нет.';

      if (Class.schedule.length > 5) {
        keyboard.inline = false;
        additionallString += '\n\nИспользовать: рсп <номер файла>.';
      }

      // console.log('fl', filenames);

      // filenames = filenames.filter(f => f);

      let filesEnding = null;

      const lastSymbol = Number(Class.schedule.length.toString().slice(-1));

      if (lastSymbol === 0 || lastSymbol >= 5) {
        filesEnding = `Найдено ${Class.schedule.length} файлов`;
      } else if (lastSymbol === 1) {
        filesEnding = `Найден ${Class.schedule.length} файл`;
      } else if (lastSymbol > 1 && lastSymbol < 5) {
        filesEnding = `Найдено ${Class.schedule.length} файла`;
      } else {
        filesEnding = `Найдено ${Class.schedule.length} файлов (!)`;
      }

      if (keyboard.inline) {
        keyboard = JSON.stringify(keyboard);
      } else {
        keyboard = defaultKeyboard;
      }

      await sendMessage(`${filesEnding} с расписанием для ${Class.className}.\n\nСегодня ${todayDate[0]}.${additionallString}\n\n${filenames.join('\n')}\n\nПоследнее обновление в боте: ${moment(Class.lastUpdate).locale('ru').format('DD.MM, HH:mm:ss')}.`, groupId, { keyboard }, userId, null, 'low');
      Class.alreadyGetting = false;
    } catch (error) {
      Class.alreadyGetting = false;
      Class.schedule = null;

      let keyboard = defaultKeyboard;
      keyboard.inline = true;
      keyboard = JSON.stringify(keyboard);
      defaultKeyboard.inline = false;

      await sendMessage(`вышла ошибочка\n${error}`, groupId, { keyboard }, userId, null, 'high');
      console.log(error);
    }
  }
};
