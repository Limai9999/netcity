const getDataFromNetCity = require('../modules/getDataFromNetCity');
const moment = require('moment');
moment.locale('ru');

const {Keyboard} = require('vk-io');

async function schedule({vk, classes, args = [], peerId, userId, payload, banned}) {
  try {
    if (banned.banned) {
      await vk.removeAllLastSentMessages(peerId);

      return vk.sendMessage({
        message: `Вы не можете использовать эту команду, т.к вы заблокированы.\nПричина: ${banned.reason}`,
        peerId,
        priority: 'low',
      });
    }

    if (!payload) {
      return vk.sendMessage({
        message: 'Эта команда работает только через кнопки.',
        peerId,
        priority: 'low',
      });
    }

    const scheduleType = payload.button;

    if (!scheduleType) {
      vk.sendMessage({
        message: 'Неверный тип расписания.',
        peerId,
      });
      return false;
    }

    const {login, password} = await classes.getNetCityData(peerId);
    const className = await classes.getClassName(peerId);

    if (!login || !password) {
      return vk.sendMessage({
        message: 'Не указаны логин и пароль.\nИспользуйте команду "класс" для добавления данных.',
        peerId,
        priority: 'low',
      });
    }

    const isAlreadyGettingData = await classes.isGettingData(peerId);

    if (isAlreadyGettingData) {
      return vk.sendMessage({
        message: 'Подождите, получение данных уже начато.',
        peerId,
        priority: 'low',
      });
    }

    const schedule = await classes.getSchedule(peerId);

    let scheduleNotGot = schedule.length === 0;
    if (scheduleType === 'updateschedule') scheduleNotGot = true;

    let loadingMsgId = null;

    if (scheduleNotGot) {
      const res = await vk.sendMessage({
        message: 'Расписание загружается...',
        peerId,
        priority: 'low',
      });

      loadingMsgId = res;
    }

    const getSchedule = async () => {
      if (scheduleNotGot) {
        const data = await getDataFromNetCity({login, password, className, vk, classes, peerId});
        return data;
      } else {
        return schedule;
      }
    };

    const todayDates = [
      moment().format('DD.MM'),
      moment().format('D.MM'),
    ];

    if (scheduleType === 'getschedule' || scheduleType === 'updateschedule') {
      const scheduleData = await getSchedule();

      const totalFiles = scheduleData.length;
      let totalFilesMessage = '';
      if (totalFiles === 1) {
        totalFilesMessage = 'Найден 1 файл';
      } else {
        totalFilesMessage = `Найдено ${totalFiles} файлов`;
        if (totalFiles > 1 && totalFiles < 5) totalFilesMessage = `Найдено ${totalFiles} файла`;
      }

      let noticeIfNoScheduleForToday = true;
      let today = `Сегодня ${todayDates[0]}`;

      let keyboard = Keyboard.builder().inline();

      const scheduleFilenames = scheduleData.map((data, index) => {
        const {filename, status, date} = data;
        const isToday = todayDates.includes(date);
        if (isToday) noticeIfNoScheduleForToday = false;

        keyboard = keyboard.textButton({
          label: date || index + 1,
          payload: {
            button: 'chooseschedule',
            filename,
          },
          color: Keyboard.PRIMARY_COLOR,
        });

        return `${index + 1} - ${filename} ${isToday ? '✅' : ''}${status ? '' : '⚠️'}`;
      }).join('\n');

      noticeIfNoScheduleForToday ? today += ' - На сегодня расписания нет.' : null;

      let lastUpdate = await classes.getLastDataUpdate(peerId);
      lastUpdate = `Последний раз обновлено в: ${moment(lastUpdate).format('DD.MM, HH:mm:ss')}`;

      const scheduleMessage = `${totalFilesMessage} с расписанием для ${className}.\n\n${today}\n\n${scheduleFilenames}\n\n${lastUpdate}`;

      keyboard = keyboard
          .row()
          .textButton({
            label: 'Домашнее задание',
            payload: {
              button: 'gethomework',
            },
            color: Keyboard.POSITIVE_COLOR,
          })
          .row()
          .textButton({
            label: 'Обновить расписание',
            payload: {
              button: 'updateschedule',
            },
            color: Keyboard.NEGATIVE_COLOR,
          });

      if (loadingMsgId) {
        vk.removeMessage({
          messageId: loadingMsgId,
          peerId,
          type: 'bot',
        });
      }

      vk.sendMessage({
        message: scheduleMessage,
        peerId,
        keyboard,
        priority: 'medium',
      });
    } else if (scheduleType === 'chooseschedule' || scheduleType === 'oldschedule') {
      const {filename} = payload;

      const isOldSchedule = scheduleType === 'oldschedule';

      const scheduleData = isOldSchedule ? await classes.getSpecificOldSchedule(peerId, filename) : await classes.getSpecificSchedule(peerId, filename);

      if (!scheduleData) {
        return vk.sendMessage({
          message: 'Не удалось получить это расписание.',
          peerId,
          priority: 'low',
        });
      }

      if (!scheduleData.status) {
        const error = scheduleData.err;
        console.log('choose schedule error:', error);
        return vk.sendMessage({
          message: `Произошла ошибка при получения этого расписания.\nОшибка: ${error}`,
          peerId,
          priority: 'low',
        });
      }

      const {date, distant, schedule, startTime, totalLessons} = scheduleData;

      const scheduleInfo = isOldSchedule ? `Старое расписание на ${date} для ${className}.` : `Расписание на ${date} для ${className}.`;
      const isDistant = distant ? '(дистант)' : false;
      const additionalInfo = [
        `Всего уроков: ${totalLessons}`,
        `начинаются в ${startTime}`,
        isDistant,
      ].filter((info) => info).join(', ') + '.';

      const scheduleFormatted = schedule.join('\n');

      vk.sendMessage({
        message: `${scheduleInfo}\n\n${additionalInfo}\n\n${scheduleFormatted}`,
        peerId,
        priority: 'medium',
      });
    }
  } catch (error) {
    vk.sendMessage({
      message: `Произошла ошибка при выполнении команды.\nОшибка: ${error.message}`,
      peerId,
    });
    console.log('GET SCHEDULE ERROR:', error);
  }
}

module.exports = {
  name: 'расписание',
  aliases: ['getschedule', 'chooseschedule', 'updateschedule', 'oldschedule'],
  description: 'получить расписание',
  requiredArgs: 0,
  usingInfo: 'Использование: расписание',
  isGroupOnly: true,
  isInPMOnly: false,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: true,
  execute: schedule,
};
