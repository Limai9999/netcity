/* eslint-disable new-cap */
const puppeteer = require('puppeteer');

const {readFileSync} = require('fs');

async function getGradesFromNetCity({login, password, isDebug}) {
  if (isDebug) {
    console.log('debug grades');
    const debugData = JSON.parse(readFileSync('./src/modules/netcity/gradesDebugData.json'));
    return debugData;
  }

  let browser;
  let logOut;

  const timeout = setTimeout(() => {
    if (logOut) logOut();
    if (browser) browser.close();
    console.log('grades timeout');
    throw new Error('Не удалось получить данные.');
  }, 120000);

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    console.log('browser opened');
    const page = await browser.newPage();

    await page.setViewport({
      width: 2048,
      height: 1152,
    });

    const homePageRes = await page.goto('http://62.245.43.79/', {
      waitUntil: 'networkidle0',
    });

    const status = homePageRes.status();

    logOut = async () => {
      await page.evaluate(async () => {
        // eslint-disable-next-line new-cap
        await Logout();
      });

      await page.waitForNetworkIdle({idleTime: 2000, timeout: 10000});

      await browser.close();
      console.log('browser closed');
    };

    if (status != 200) {
      logOut();
      throw new Error('Сетевая Страна в данный момент недоступна.');
    }

    console.log('loaded main page');

    await page.select('#schools', '8');

    await page.focus('input[name="UN"]');
    await page.keyboard.type(login);

    await page.focus('input[name="PW"]');

    await page.keyboard.type(password);

    page.keyboard.press('Enter');

    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });

    console.log('logged in');

    const h1 = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1.textContent;
    });

    if (h1 === 'Предупреждение о безопасности') {
      page.click('button[title="Продолжить"]');
      await page.waitForNavigation({
        waitUntil: 'networkidle0',
      });
    } else if (h1 === 'Ошибка') {
      await page.waitForTimeout(3000);

      const error = await page.evaluate(async () => {
        return document.querySelector('.bootstrap-dialog-message').innerText;
      });

      console.log('h1 error', error);

      logOut();
      throw new Error(`Ошибка при входе в Сетевую Инстанцию.\n\n${error ? error : ''}`);
    }

    // открытие отчетов
    page.evaluate(() => {
      SetSelectedTab(24, '/asp/Reports/Reports.asp');
    });
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
    console.log('opened reports');

    // выбор Отчет об успеваемости и посещаемости
    page.evaluate(() => {
      GoToLink('ReportStudentTotal.asp', '2', '1');
    });
    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });
    console.log('opened report student total, waiting for report generation');

    // waiting for report generating
    await page.evaluate(() => {
      return new Promise((resolve) => {
        report.generate().then(() => {
          resolve();
        });
      });
    });
    console.log('report generated');

    const reportResult = await page.evaluate(() => {
      try {
        const report = document.querySelector('#report').children[0];
        const infoTable = report.children[4].children[0].children[0].children[1];
        const infoResult = Array.from(infoTable.children)
            .filter((e) => e.tagName === 'SPAN')
            .map((e) => e.innerText);

        const gradesBody = report.children[6].children[0];
        const daysBody = gradesBody.children[1];
        const monthArray = Array.from(gradesBody.children[0].children)
            .filter((e) => e.innerText !== 'Предмет' && e.innerText !== 'Средняя\nоценка')
            .map((e) => {
              return {text: e.innerText, totalDays: +e.attributes[0].value};
            });
        const daysArray = Array.from(daysBody.children);
        const daysData = [];

        let monthIndex = 0;
        let dayIndex = 0;
        for (let i = 1; i <= daysArray.length; i++) {
          if (dayIndex === monthArray[monthIndex].totalDays) {
            monthIndex++;
            dayIndex = 0;
          };
          daysData.push({
            month: monthArray[monthIndex].text,
            day: daysArray[i - 1].innerText,
            lessonsWithGrades: [],
          });
          dayIndex++;
        }

        const lessonsArray = Array.from(gradesBody.children);
        lessonsArray.splice(0, 2);

        const averageGrades = [];

        lessonsArray.map((lesson) => {
          const grades = Array.from(lesson.children);
          const average = grades.find((e) => e.className === 'сell-num-2');
          const gradesFiltered = grades.filter((element) => element.className !== 'cell-text' && element.className !== 'сell-num-2');

          if (!averageGrades.find((e) => e.lesson === average.innerText)) {
            averageGrades.push({
              lesson: grades[0].innerText,
              average: average.innerText,
            });
          }

          gradesFiltered.map((e, index) => {
            const gradesResult = e.innerText
                .trim()
                .replace(/\s/g, '')
                .split('')
                .filter((e) => !isNaN(e))
                .sort((a, b) => b - a);

            daysData[index].lessonsWithGrades.push({
              lesson: grades[0].innerText,
              grades: gradesResult,
            });
          });
        });

        return {
          info: infoResult,
          result: {
            daysData,
            averageGrades,
          },
        };
      } catch (error) {
        return {
          error: error.message,
        };
      }
    });
    console.log('report parsed');

    const screenshotPath = `./src/gradeReportScreenshots/GradeReport_${login}_${Date.now()}.png`;

    const reportTableElement = await page.$('.table-print');
    await reportTableElement.screenshot({path: screenshotPath});
    console.log('screenshot saved');

    if (reportResult.error) {
      logOut();
      throw new Error(reportResult.error);
    }

    console.log('GOT GRADES REPORT');

    logOut();

    reportResult.screenshotPath = screenshotPath;

    clearTimeout(timeout);

    return reportResult;
  } catch (error) {
    clearTimeout(timeout);
    console.log('grades get error', error);
    if (logOut) logOut();
    if (browser) browser.close();
    throw new Error(error);
  }
};

module.exports = getGradesFromNetCity;
