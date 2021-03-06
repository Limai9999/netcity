const getGrades = require('./getGrades');

async function handleGradesData({vk, classes, login, password, isDebug, shouldUpdate, peerId}) {
  try {
    await classes.setAlreadyGettingData(peerId, true);
    const isAlreadyHaveGrades = await classes.getGrades(peerId);
    isAlreadyHaveGrades ? null : shouldUpdate = true;
    const gradesData = shouldUpdate ? await getGrades({login, password, isDebug}) : await classes.getGrades(peerId);
    await classes.setAlreadyGettingData(peerId, false);

    if (shouldUpdate) await classes.setLastGradesUpdate(peerId, Date.now());

    // getting grades before update
    const previousGrades = await classes.getGrades(peerId);
    const changesList = [];

    // console.log(previousGrades);
    // console.log(gradesData);

    // saving grades after update
    if (gradesData) await classes.setGrades(gradesData, peerId);

    // checking for changes
    // checking average grades
    let oldAverageGrades;
    if (previousGrades) oldAverageGrades = previousGrades.result.averageGrades;
    let newAverageGrades;
    if (gradesData) newAverageGrades = gradesData.result.averageGrades;

    if (oldAverageGrades && newAverageGrades) {
      if (oldAverageGrades.length !== newAverageGrades.length) {
        changesList.push(`Количество предметов в отчете изменилось.\nБыло: "${oldAverageGrades.length}", стало: "${newAverageGrades.length}"`);
      }

      for (let i = 0; i < oldAverageGrades.length; i++) {
        const oldGrade = oldAverageGrades[i];
        const newGrade = newAverageGrades.find(({lesson}) => lesson === oldGrade.lesson);

        if (!newGrade) {
          changesList.push(`Предмет "${oldGrade.lesson}" был удален.`);
          continue;
        } else if (!oldGrade && newGrade) {
          changesList.push(`Предмет "${newGrade.lesson}" был добавлен.`);
          continue;
        }

        if (oldGrade.average !== newGrade.average) {
          changesList.push(`Средний балл предмета "${newGrade.lesson}" изменился.\nБыл: "${oldGrade.average}", стал: "${newGrade.average}"`);
        }
      }

      // checking days grades
      const oldDaysData = previousGrades.result.daysData;
      const newDaysData = gradesData.result.daysData;

      for (let i = 0; i < oldDaysData.length; i++) {
        const oldDayData = oldDaysData[i];
        const newDayData = newDaysData.find(({month, day}) => month === oldDayData.month && day === oldDayData.day);

        if (!newDayData) {
          changesList.push(`День "${oldDayData.day} ${oldDayData.month}" был удален.`);
          continue;
        }

        const oldLessonsWithGrades = oldDayData.lessonsWithGrades;
        const newLessonsWithGrades = newDayData.lessonsWithGrades;

        const changes = [];

        for (let j = 0; j < oldLessonsWithGrades.length; j++) {
          const oldLesson = oldLessonsWithGrades[j];
          const newLesson = newLessonsWithGrades.find(({lesson}) => lesson === oldLesson.lesson);

          if (!newLesson) continue;

          const oldGradesString = oldLesson.grades.join(', ');
          const newGradesString = newLesson.grades.join(', ');

          if (oldGradesString !== newGradesString) {
            if (oldGradesString === '') {
              changes.push(`Выставлены оценки "${newGradesString}" по предмету "${newLesson.lesson}".`);
            } else if (newGradesString === '') {
              changes.push(`Убраны оценки "${oldGradesString}" по предмету "${newLesson.lesson}".`);
            } else {
              changes.push(`Оценки по предмету "${newLesson.lesson}" изменились.\nБыло: "${oldLesson.grades.length ? oldGradesString : '-'}", стало: "${newLesson.grades.length ? newGradesString : '-'}"`);
            }
          }
        }

        if (changes.length) {
          const changesMsg = changes.map((change, index) => `${index + 1}. ${change}`).join('\n');
          const message = `Изменения на "${newDayData.day} ${newDayData.month}":\n${changesMsg}`;
          changesList.push(message);
        }
      }

      if (previousGrades && changesList.length) {
        const changesMsg = changesList.map((change, index) => `${index + 1}) ${change}`).join('\n\n');

        await vk.sendMessage({
          message: `В оценках произошло ${changesList.length} изменений:\n\n${changesMsg}`,
          peerId,
        });
      }
    }

    return gradesData;
  } catch (error) {
    await classes.setAlreadyGettingData(peerId, false);
    console.log('Error in handleGradesData:', error);
    return {
      error: error.message,
    };
  }
};

module.exports = handleGradesData;
