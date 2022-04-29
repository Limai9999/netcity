/* eslint-disable max-len */
const Excel = require('exceljs');

// test
// (async () => {
//   const testFiles = [
//     'расписание на 05.03.xlsx',
//     'расписание_на_02.02.xlsx',
//     'расписание на 03.03.xlsx',
//     'расписание_17_декабря.xlsx',
//     'расписание_на_10_декабря.xlsx'
//   ];

//   testFiles.map(async r => {
//     const schedule = await parse(r, '8Б');
//     console.log(schedule);
//   });
// })();

// setInterval(() => {

// }, 141123);

async function parse(filename, className) {
  try {
    // открытие файла
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(`./src/files/${filename}`);

    let classColumn = null;

    // поиск столбца класса
    workbook.worksheets[0].columns.map((element, index) => {
      if (element.values.find(e => e === className) && !classColumn) return classColumn = index;
    });

    // ошибка если класс не найден
    if (!classColumn) {
      console.log('error parseSchedule', 'no class column', filename);
      return {
        error: `Не удалось найти столбец класса ${className}.\nПри добавлении класса буква должна быть такая же, как и в табличном расписании, т.е с учётом регистра.`,
        filename
      };
    }

    // масcивы информации
    let timeArr = workbook.worksheets[0].columns[2].values;
    let lessonsArr = workbook.worksheets[0].columns[classColumn].values;
    let classRoomsArr = workbook.worksheets[0].columns[classColumn + 1].values;

    const secondSmenaColumn = timeArr.findIndex(e => e === '2 смена');

    // отделение ненужных элементов до 2 смены
    timeArr = timeArr.splice(secondSmenaColumn + 1, timeArr.length);
    lessonsArr = lessonsArr.splice(secondSmenaColumn + 1, lessonsArr.length);
    classRoomsArr = classRoomsArr.splice(secondSmenaColumn + 1, classRoomsArr.length);

    // три for для нормального обозначения пустых элементов
    for (let i = 0; i < timeArr.length; i++) {
      if (timeArr[i] === null || timeArr[i] === undefined) {
        timeArr[i] = null;
      }
    }

    for (let i = 0; i < lessonsArr.length; i++) {
      if (lessonsArr[i] === null || lessonsArr[i] === undefined) {
        lessonsArr[i] = null;
      }
    }

    for (let i = 0; i < classRoomsArr.length; i++) {
      if (classRoomsArr[i] === null || classRoomsArr[i] === undefined) {
        classRoomsArr[i] = null;
      }
    }

    // поиск строки где начинается все нужная информация
    let startString = null;

    for (let i = 0; i < timeArr.length; i++) {
      if (timeArr[i] && timeArr[i].split('-').length === 2 && !startString) {
        startString = i;
      }
    }

    // сопоставление времени, предмета и кабинета в обьект и добавление в массив + понимание когда начинаются уроки
    const preResult = [];
    let startTime = false;
    let room = false;

    for (let i = 0; i < timeArr.length; i++) {
      if (!timeArr[i] && !lessonsArr[i] && !classRoomsArr[i]) continue;
      if (timeArr[i] === 'Время' || lessonsArr[i] === 'Предмет' || classRoomsArr[i] === 'Каб.') continue;
      if (lessonsArr[i] && !startTime) startTime = timeArr[i].split('-')[0];
      if (classRoomsArr[i] && !room) {
        room = classRoomsArr[i];
        // classRoomsArr[i] = null;
      }
      preResult.push({
        time: timeArr[i],
        lesson: lessonsArr[i],
        room: classRoomsArr[i]
      });
    }

    // console.log('resarr', preResult);

    // перевод массива в строки

    const formattedResult = [];

    const checkRepeatingTime = [];

    preResult.map(r => {
      if (checkRepeatingTime.find(e => e === r.time)) return;
      checkRepeatingTime.push(r.time);

      return formattedResult.push(`${r.time} - ${r.lesson ? r.lesson : '-'}${r.room && r.room.toString().length <= 3 ? ` - ${r.room}` : ''}`);
    });

    // удаление повторяющихся строк
    const schedule = [];

    formattedResult.map(r => {
      const found = schedule.find(e => e === r);

      if (found) return;
      schedule.push(r);
    });

    // кол-во уроков
    let totalLessons = 0;

    schedule.map(r => {
      if (r.split('-')[2] !== ' ') totalLessons ++;
    });

    // получение даты из названия файла
    const splitted = filename.replace(/_/g, ' ').split(' ');
    let date = null;

    try {
      date = splitted.length > 3 ? `${splitted[2]} ${splitted[3]}`.replace('.xlsx', '') : splitted[2].replace('.xlsx', '');
      if (filename.startsWith('изменения_в_расписании_на_')) date = splitted[4].replace('.xlsx', '');
    } catch (error) {
      console.log('error parseSchedule', error, filename);
      return {
        error: `Ошибка при изменении имени файла.\n\n${error}`,
        filename
      };
    }

    const returning = {
      distant: false,
      schedule,
      startTime,
      totalLessons,
      date,
      filename,
      room
    };

    console.log('parsed schedule');

    return returning;
    // console.log(returning);

    // console.log('fr', formattedResult);

    // console.log('startstr', startString);

    // console.log('result', schedule);

    // console.log('time', timeArr);
    // console.log('lessons', lessonsArr);
    // console.log('classRoomsArr', classRoomsArr);
  } catch (error) {
    console.log('error parseSchedule', error, filename);
    return {
      error,
      filename
    };
  }
}

// production
module.exports = parse;
