const {Keyboard} = require('vk-io');

const getGradesFromNetCity = require('../modules/netcity/getGradesFromNetCity');

async function getGrades({vk, classes, peerId, payload}) {
  try {
    const {username, password} = await classes.getNetCityData(peerId);
    if (!username || !password) {
      return vk.sendMessage({
        message: 'Не указаны логин и пароль для подключения к Сетевой Планете.\nУкажите командой "сетевой"',
        peerId,
      });
    }

    let gradesMode = 'getgrades';
    if (payload) gradesMode = payload.button;

    await classes.setAlreadyGettingData(peerId, true);

    let loadingMsgId = null;

    if (gradesMode === 'getgrades') {
      loadingMsgId = await vk.sendMessage({
        message: 'Загрузка оценок...',
        peerId,
      });
    }

    const gradesData = gradesMode === 'getgrades' ? await getGradesFromNetCity({username, password}) : await classes.getGrades(peerId);
    await classes.setAlreadyGettingData(peerId, false);

    if (loadingMsgId) {
      await vk.removeMessage({
        messageId: loadingMsgId,
        peerId,
        type: 'bot',
      });
    }

    if (!gradesData) {
      console.log(gradesData);
      return vk.sendMessage({
        message: `Не удалось получить оценки\nОшибка: ${gradesData.error || 'неизвестно'}`,
        peerId,
      });
    }

    const {info, result: {averageGrades, daysData}} = gradesData;

    console.log(gradesMode, gradesData);

    const infoMsg = `Информация:\n${info.join('\n')}`;

    const previousGrades = await classes.getGrades(peerId);
    await classes.setGrades(gradesData, peerId);

    const changesList = [];

    const lessonsList = averageGrades.map(({lesson}) => {
      return lesson;
    });

    const getTotalGradesOneLesson = (lessonName) => {
      const grades = [];

      daysData.map(({lessonsWithGrades}) => {
        lessonsWithGrades.find(({lesson}) => lesson === lessonName).grades.map((grade) => grades.push(grade));
      });

      // console.log(grades);
      return grades;
    };

    const keyboard = Keyboard.builder()
        .textButton({
          label: 'Cредний балл',
          payload: {
            button: 'getaveragegrades',
          },
          color: Keyboard.POSITIVE_COLOR,
        })
        .textButton({
          label: 'Кол-во оценок',
          payload: {
            button: 'getgradestotal',
          },
          color: Keyboard.POSITIVE_COLOR,
        })
        .inline();

    if (gradesMode === 'getgrades') {
      await vk.sendMessage({
        message: `${infoMsg}\n\nВыберите действие`,
        peerId,
        keyboard,
        priority: 'low',
      });
    } else if (gradesMode === 'getaveragegrades') {
      const result = averageGrades.map(({lesson, average}, index) => {
        const totalGrades = getTotalGradesOneLesson(lesson).length;
        const totalGradesMsg = average == 0 ? '' : (lesson.length >= 20 ? '\n' : ' | ') + `Оценок - ${totalGrades}.`;
        const lessonStatus = totalGrades < 3 ? '❌' : '✅';
        return `${index + 1}. ${lesson}: ${average}${totalGradesMsg} ${lessonStatus}`;
      }).join('\n\n');

      const additionalInfo = `Доп. информация:\n✅ - достаточно оценок за четверть\n❌ - недостаточно оценок за четверть`;

      await vk.sendMessage({
        message: `Средний балл ${averageGrades.length} предметов:\n\n${result}\n\n${additionalInfo}`,
        peerId,
        priority: 'medium',
        keyboard,
      });
    } else if (gradesMode === 'getgradestotal') {
      return await vk.sendMessage({
        message: `Эта команда пока что не реализована.`,
        peerId,
        priority: 'medium',
        keyboard,
      });

      const result = lessonsList.map((lesson, index) => {
        const totalGrades = getTotalGradesOneLesson(lesson);

        const gradesObj = {};

        totalGrades.map((grade) => {
          if (gradesObj[grade]) {
            gradesObj[grade].count++;
          } else {
            gradesObj[grade] = {lesson, count: 1};
          }
        });

        return gradesObj;
      });

      const resultArray = result.map((res) => {
        return Object.keys(res).map((key) => {
          return {
            grade: key,
            count: res[key].count,
            lesson: res[key].lesson,
          };
        });
      });

      console.log(resultArray);
    }

    if (previousGrades && changesList.length) {
      const changesMsg = changesList.map((change, index) => `${index + 1}. ${change}`).join('\n');

      await vk.sendMessage({
        message: `В оценках произошло ${changesList.length} изменений:\n${changesMsg}`,
        peerId,
        priority: 'low',
      });
    }
  } catch (error) {
    console.log('VK GET GRADES ERROR:', error);

    await classes.setAlreadyGettingData(peerId, false);
    await vk.sendMessage({
      message: `Не удалось получить оценки\nОшибка: ${error.message}`,
      peerId,
    });
  }
};

module.exports = {
  name: 'оценки',
  aliases: ['getgrades', 'getaveragegrades', 'getgradestotal'],
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
