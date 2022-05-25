const {Keyboard, Attachment} = require('vk-io');
const moment = require('moment');

moment.locale('ru');

const getGradesData = require('../modules/netcity/getAndHandleGrades');

async function getGrades({vk, classes, peerId, payload}) {
  let removeLoadingMessage;
  try {
    const {login, password} = await classes.getNetCityData(peerId);
    if (!login || !password) {
      return vk.sendMessage({
        message: 'Не указаны логин и пароль для подключения к Сетевой Планете.\nУкажите командой "сетевой"',
        peerId,
      });
    }

    const isAlreadyGetting = await classes.isGettingData(peerId);
    if (isAlreadyGetting) {
      return vk.sendMessage({
        message: 'Подождите, получение оценок уже идет...',
        peerId,
      });
    }

    let gradesMode = 'getgrades';
    if (payload) gradesMode = payload.button;

    let loadingMsgId = null;

    if (gradesMode === 'getgrades' || gradesMode === 'updategrades') {
      loadingMsgId = await vk.sendMessage({
        message: 'Загрузка оценок...',
        peerId,
      });
    }

    removeLoadingMessage = () => {
      if (loadingMsgId) {
        vk.removeMessage({
          peerId,
          messageId: loadingMsgId,
          type: 'bot',
        });
      }
    };

    let shouldUpdate = gradesMode === 'updategrades';
    await classes.getGrades(peerId) ? null : shouldUpdate = true;
    const gradesData = await getGradesData({vk, classes, login, password, isDebug: vk.isDebug(), shouldUpdate, peerId});

    removeLoadingMessage();

    if (!gradesData || gradesData.error) {
      console.log(gradesData);
      return vk.sendMessage({
        message: `Не удалось получить оценки\nОшибка: ${gradesData.error || 'неизвестно'}`,
        peerId,
      });
    }

    const {info, result: {averageGrades, daysData}, screenshotPath} = gradesData;

    // console.log(gradesMode, gradesData);

    const infoMsg = `Информация:\n${info.join('\n')}`;

    const lessonsList = averageGrades.map(({lesson}) => {
      return lesson;
    });

    const getTotalGradesOneLesson = (lessonName) => {
      const grades = [];

      // console.log(lessonName);

      daysData.map(({lessonsWithGrades}) => {
        lessonsWithGrades.find(({lesson}) => lesson === lessonName).grades.map((grade) => grades.push(grade));
      });

      // console.log(grades);
      return grades;
    };

    const getGradesToday = () => {
      const {month, day, lessonsWithGrades} = daysData[daysData.length - 1];

      let totalGrades = 0;

      const result = lessonsWithGrades.map(({lesson, grades}) => {
        if (!grades.length) return;

        grades.forEach(() => totalGrades++);

        return `${lesson}: ${grades.join(', ')}`;
      }).filter(Boolean);

      return {
        dateString: `${month} ${day}`,
        totalGrades,
        result,
      };
    };

    const keyboard = Keyboard.builder()
        .textButton({
          label: 'Полный отчёт',
          payload: {
            button: 'getfullgradesreport',
          },
          color: Keyboard.POSITIVE_COLOR,
        })
        .row()
        .textButton({
          label: 'Cредний балл',
          payload: {
            button: 'getaveragegrades',
          },
          color: Keyboard.PRIMARY_COLOR,
        })
        .textButton({
          label: 'Кол-во оценок',
          payload: {
            button: 'getgradestotal',
          },
          color: Keyboard.PRIMARY_COLOR,
        })
        .row()
        .textButton({
          label: 'За сегодня',
          payload: {
            button: 'getgradestoday',
          },
          color: Keyboard.PRIMARY_COLOR,
        })
        .row()
        .textButton({
          label: 'Обновить оценки',
          payload: {
            button: 'updategrades',
          },
          color: Keyboard.NEGATIVE_COLOR,
        })
        .inline();

    if (gradesMode === 'getgrades' || gradesMode === 'updategrades') {
      const lastUpdate = await classes.getLastGradesUpdate(peerId);
      const lastUpdateMsg = `Последний раз обновлено: ${moment(lastUpdate).fromNow()}`;

      await vk.sendMessage({
        message: `${infoMsg}\n\n${lastUpdateMsg}\n\nВыберите действие:`,
        peerId,
        keyboard,
        priority: 'medium',
      });
    } else if (gradesMode === 'getaveragegrades') {
      const result = averageGrades.map(({lesson, average}, index) => {
        const totalGrades = getTotalGradesOneLesson(lesson).length;
        const totalGradesMsg = average == 0 ? '' : (lesson.length >= 20 ? '\n' : ' | ') + `Оценок: ${totalGrades} шт.`;
        const lessonStatus = totalGrades < 3 ? '❌' : '✅';
        return `${index + 1}. ${lesson}: ${average}${totalGradesMsg} ${lessonStatus}`;
      }).join('\n\n');

      const additionalInfo = `Доп. информация:\n✅ - достаточно оценок за четверть.\n❌ - недостаточно оценок за четверть.`;

      await vk.sendMessage({
        message: `Средний балл по ${averageGrades.length} предметам:\n\n${result}\n\n${additionalInfo}`,
        peerId,
        keyboard,
      });
    } else if (gradesMode === 'getgradestotal') {
      const lessonsWithGrades = lessonsList.map((lesson) => {
        const totalGrades = getTotalGradesOneLesson(lesson);

        return {
          lesson,
          grades: totalGrades,
        };
      });

      const result = lessonsWithGrades.map(({lesson, grades}) => {
        const totalGrades = grades.length;

        if (!totalGrades) return {lesson, totalGrades};

        const gradesEach = {};
        grades.map((grade) => {
          if (!gradesEach[grade]) gradesEach[grade] = 0;
          gradesEach[grade]++;
        });

        const gradesEachList = Object.keys(gradesEach);

        // отсоритровка оценок по убыванию
        gradesEachList.sort((a, b) => b - a);

        const gradesEachResult = gradesEachList.map((grade) => {
          return `Оценка ${grade}: ${gradesEach[grade]} шт.`;
        });

        return {
          lesson,
          totalGrades,
          gradesEach: gradesEachResult,
        };
      });

      const gradesMessage = result.map(({lesson, totalGrades, gradesEach}, index) => {
        if (!totalGrades) {
          return `${index + 1}. ${lesson}: нет оценок`;
        }

        const gradesEachResult = gradesEach.join('\n');

        return `${index + 1}. ${lesson} - ${totalGrades} оценок:\n${gradesEachResult}`;
      }).join('\n\n');

      const message = `Количество оценок по ${lessonsList.length} предметам:\n\n${gradesMessage}`;

      await vk.sendMessage({
        message,
        peerId,
        priority: 'high',
        keyboard,
      });
    } else if (gradesMode === 'getfullgradesreport') {
      if (!screenshotPath) {
        await vk.sendMessage({
          message: 'Не получилось отправить скриншот. Попробуйте обновить оценки.',
          peerId,
        });

        return;
      }

      const [{id, owner_id}] = await vk.uploadAndGetPhoto(screenshotPath, peerId);
      const attachment = new Attachment({
        type: 'photo',
        payload: {
          id,
          owner_id,
        },
      });

      const netCityNames = [
        'Сетевой Вселенной',
        'Сетевого Города',
        'Сетевичка',
        'Сетевой Инстанции',
        'Сетевой Планеты',
        'Сетевого района',
        'Сетевой Чечни',
      ];

      const netCityName = netCityNames[Math.floor(Math.random() * netCityNames.length)];

      await vk.sendMessage({
        message: `Полный отчёт из ${netCityName}:`,
        peerId,
        attachment,
      });
    } else if (gradesMode === 'getgradestoday') {
      const {dateString, totalGrades, result} = getGradesToday();

      const res = result.map((data, index) => {
        return `${index + 1}. ${data}`;
      });

      const message = `За ${dateString} получено ${totalGrades} оценок по ${result.length} предметам:\n\n${res.join('\n\n')}`;

      await vk.sendMessage({
        message,
        peerId,
      });
    }
  } catch (error) {
    if (removeLoadingMessage) removeLoadingMessage();
    console.log('VK GET GRADES ERROR:', error);

    await classes.setAlreadyGettingData(peerId, false);
    await vk.sendMessage({
      message: `Не удалось получить оценки.\n\nОшибка: ${error.message}`,
      peerId,
    });
  }
};

module.exports = {
  name: 'оценки',
  aliases: ['getgrades', 'updategrades', 'getaveragegrades', 'getgradestotal', 'getfullgradesreport', 'getgradestoday'],
  description: 'получить оценки',
  requiredArgs: 0,
  usingInfo: 'Использование: оценки',
  isGroupOnly: false,
  isInPMOnly: true,
  isAdminOnly: false,
  isHiddenFromList: false,
  continuteBanned: false,
  showInAdditionalMenu: true,
  execute: getGrades,
};
