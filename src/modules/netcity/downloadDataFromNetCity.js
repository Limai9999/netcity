const puppeteer = require('puppeteer');
const moment = require('moment');
const wait = require('../../utils/wait');

const downloadFile = require('../downloadFile');
const passwordManager = require('../passwordManager');

const qs = require('qs');

async function getDataFromNetCity(username, cryptedPassword, isDistant, test, isGroup) {
  if (test) {
    return {
      schedule: [
        {status: true, filename: 'расписание_на_test.test.xlsx'},
        // {status: false, err: 'пошел нахуй ltd', filename: 'расписание_на_11.05.xlsx'},
        // {status: true, filename: 'расписание_на_07.05.xlsx'},
      ],
      homework: [],
    };
  }

  let logOut;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--no-sandbox'],
    });

    console.log('browser opened');

    const page = await browser.newPage();

    // Connect to Chrome DevTools
    // const client = await page.target().createCDPSession();

    // network test
    // await client.send('Network.emulateNetworkConditions', {
    //   offline: false,
    //   downloadThroughput: 2000 * 1024 / 8,
    //   uploadThroughput: 2000 * 1024 / 8,
    //   latency: 510
    // });

    console.log('page opened');

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

    console.log('goto success');

    console.log('loaded main page');

    await page.select('#schools', '8');

    await page.focus('input[name="UN"]');
    await page.keyboard.type(username);

    await page.focus('input[name="PW"]');

    let password = passwordManager('decrypt', cryptedPassword);

    if (!password) {
      if (isGroup) {
        logOut();
        throw new Error('Не удалось дешифровать пароль.');
      }
      password = cryptedPassword;
    }

    if (cryptedPassword.length < 20) {
      if (isGroup) {
        logOut();
        throw new Error('Пароль не зашифрован командой "шифр".');
      }
      password = cryptedPassword;
    }

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
      await page.waitForTimeout(1500);

      const error = await page.evaluate(async () => {
        return document.querySelector('.bootstrap-dialog-message').innerText;
      });

      console.log(error);

      logOut();
      throw new Error(`Ошибка при входе в Сетевую Инстанцию.\n\n${error ? error : ''}`);
    }

    // distant
    let addResults;

    if (isDistant) {
      await page.evaluate(async () => {
        // eslint-disable-next-line new-cap
        await SetSelectedTab(20, '/asp/Calendar/DayViewS.asp');
      });

      await page.waitForSelector('.schedule-table');

      await wait(1500, 1500);

      const Elements = [];

      await Promise.all([0, 1].map(async (r) => {
        setTimeout(async () => {
          const date = moment().add(r, 'days').format('D.M.YY');

          await page.evaluate(async (date) => {
            document.querySelector('input[name="DATE"]').value = date;
          }, date);

          await page.focus('input[name="DATE"]');

          // await page.keyboard.type(date);

          await wait(1000, 1000);

          console.log('waited 1000');

          const elements = await page.evaluate(async () => {
            // eslint-disable-next-line new-cap
            const elements = Array.from(document.querySelector('.schedule-table').children[0].children);

            const result = elements.map((r) => {
              return Array.from(r.children).map((r) => {
                return r.innerText;
              });
            });

            // console.log(result);

            return result;
          });

          Elements.push({
            lessons: elements,
            date: moment().add(r, 'days').format('DD.MM'),
          });
          return;
        }, 14000 * r);
      }));

      await wait(20000, 20000);

      // console.log(Elements, 'elems');

      const results = Elements.map((r) => {
        const schedule = r.lessons.map((r) => {
          if (r[0] === 'Время' || r[0] === 'Уроки и мероприятия') return null;
          return `${r[0]} | ${r[1].replace('Урок: ', '')}`;
        }).filter((e) => e);

        const result = {
          distant: true,
          schedule,
          date: r.date,
          totalLessons: schedule.length,
          startTime: schedule[0].split('-')[0].trim(),
          room: false,
          filename: `Расписание на ${r.date}`,
        };

        return {status: true, distant: true, filename: `Расписание на ${r.date}`, result};
      });

      // console.log(results, 'res');

      addResults = results;
    }

    // dist end

    let homework = [];

    homework = await page.evaluate(async () => {
      if (document.querySelector('.alert.alert-info')) return {};

      const homeworkTable = document.querySelector('.table').children[0];

      if (!homeworkTable) return {};

      const homeworkArray = Array.from(homeworkTable.children)
          .filter((tr) => tr.bgColor && tr.bgColor === '#FFFFFF');

      // if (!homeworkArray.length) return false;

      const result = {};

      homeworkArray.map((tr) => {
        let plusOne = 0;

        if (tr.children[0].className === 'hidden-scr-sm') {
          plusOne = 1;

          if (result[tr.children[0].innerText] === 'hidden-scr-sm') return;
          result[tr.children[0].innerText] = [];
        }

        const resKeys = Object.keys(result);

        if (!resKeys.length || tr.children[1 + plusOne].innerText !== 'Д') return false;

        const lastItem = result[resKeys.pop()];
        lastItem.push({
          lesson: tr.children[0 + plusOne].innerText,
          task: tr.children[2 + plusOne].innerText,
        });
      });

      return result;
    });

    homework = Object.keys(homework).map((r) => {
      return {
        date: r,
        tasks: homework[r],
      };
    });

    console.log('got homework');

    page.click('a[title="Объявления"]');

    await page.waitForNavigation({
      waitUntil: 'networkidle0',
    });

    const files = await page.evaluate(async () => {
      const schedule = Array.from(document.querySelectorAll('.advertisement'))
          .filter((ad) => ad.innerText.match(/расписание|изменения|расписании/g));
      // console.log(schedule);
      return await Promise.all(schedule.map(async (r) => {
        if (r.children[0].children[3].children.length === 0) return false;
        const arr = Array.from(r.children[0].children[3].children[0].children)
            .filter((e) => e.localName === 'div');
        const links = await Promise.all(arr.map((rr) => {
          return rr.children[0].children[0].href;
        }));

        const files = await Promise.all(links.map(async (r, i) => {
          let [link, num] = r.split(',');

          link = link.replace('javascript:openAttachment(\'', '');
          link = link.replace('\'', '');

          num = num.replace(');', '');
          num = Number(num.replace(' ', ''));

          return {
            link,
            num,
          };
        }));

        return files;
      }));
    });

    const cookiesArray = await page.cookies();

    const cookiesStrArray = await Promise.all(cookiesArray.map((r) => {
      return `${r.name}=${r.value}`;
    }));

    const cookie = cookiesStrArray.join('; ');

    const at = await page.evaluate(() => {
      const element = document.querySelector('form[name="announcements"]');
      const inputElement = Array.from(element.children)
          .filter((r) => r.localName === 'input' && r.name === 'AT');
      return inputElement[0].value;
    });

    const statuses = await Promise.all(files.filter((e) => e).map(async (r) => {
      return await Promise.all(r.map(async (rr, i) => {
        const statuses = await downloadFile({
          url: 'http://62.245.43.79' + rr.link,
          headers: {
            cookie,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4469.0 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded',
          },
          data: qs.stringify({
            at,
            VER: Date.now(),
            attachmentId: rr.num,
          }),
          i,
        });

        return statuses;
      }));
    }));


    logOut();

    if (isDistant) {
      addResults.map((r) => {
        statuses[0].push(r);
      });
    }

    const schedule = [];

    statuses.map((statusesArr) => {
      statusesArr.map((r) => {
        schedule.push(r);
      });
    });

    console.log('got schedule files');

    return {
      schedule,
      homework,
    };
  } catch (error) {
    const firstScreen = 'Скриншот 1 - https://vk.cc/cdIwSt';
    const secondScreen = 'Скриншот 2 - https://vk.cc/cdIwge';
    const thirdScreen = 'Скриншот 3 - https://vk.cc/cdIwuV';
    throw new Error(`Ошибка при получении файлов расписания из Сетевой Страны.\n\n${error}\n\nЕсли вы только сейчас добавили данные для Сетевого Города, убедитесь что при входе в Сетевую Страну вы сразу попадаете на страницу с домашним заданием и оценками (дневник).\nКак это сделать:\n1.Перейдите в настройки Сетевого. ${firstScreen}\n2.Измените значние рабочего стола на дневник. ${secondScreen}.\n3.Сохраните настройки. ${thirdScreen}`);
  }
}

module.exports = getDataFromNetCity;
