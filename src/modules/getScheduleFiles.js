/* eslint-disable max-len */
/* eslint-disable no-undef */
const puppeteer = require('puppeteer');
const moment = require('moment');
const wait = require('../utils/wait');

const CryptoJS = require('crypto-js');

const { decryptKey } = require('../data/config.json');

const downloadFile = require('./download');

const qs = require('qs');

async function loginAndGetSchedule(username, cryptedPassword, distant, test) {
  if (test) {
    return [
      [
        { status: true, filename: 'расписание_на_13.10.xlsx' },
        { status: true, filename: 'расписание_на_10.09.xlsx' },
        { status: true, filename: 'расписафние_на_27.01.xlsx' },
        { status: true, filename: 'расписание_на_14.10.xlsx' },
        { status: true, filename: 'расписание_на_11.09.xlsx' },
        { status: true, filename: 'расписание_на_29.01.xlsx' },
      ]
    ];
  }
  // console.log(cryptedPassword);
  let logOut;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      // executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox']
    });

    console.log('browser started');

    const page = await browser.newPage();

    console.log('page opened');

    const homePageRes = await page.goto('http://62.245.43.79/', {
      waitUntil: 'networkidle0'
    });

    const status = homePageRes.status();

    if (status != 200) {
      throw new Error('Сетевая Страна в данный момент недоступна.');
    }

    console.log('goto success');

    logOut = async () => {
      await page.evaluate(async () => {
        // eslint-disable-next-line new-cap
        await Logout();
      });

      await browser.close();
    };

    console.log('loaded main page');

    await page.select('#schools', '8');

    await page.focus('input[name="UN"]');
    await page.keyboard.type(username);

    await page.focus('input[name="PW"]');

    const bytes = CryptoJS.AES.decrypt(cryptedPassword, decryptKey);
    const password = bytes.toString(CryptoJS.enc.Utf8);

    if (cryptedPassword.length < 15) {
      logOut();
      throw new Error('Пароль скорее всего не зашифрован.');
    }

    await page.keyboard.type(password);

    await page.keyboard.press('Enter');

    // await page.waitForNavigation();

    console.log('logged in');

    await page.waitForSelector('h1');

    const h1 = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1.textContent;
    });

    // console.log(h1);

    if (h1 === 'Предупреждение о безопасности') {
      await page.click('button[title="Продолжить"]');
      await page.waitForSelector('a[title="Объявления"]');
      // console.log('skipped warning');
    } else if (h1 === 'Ошибка') {
      await page.waitForTimeout(1500);

      const error = await page.evaluate(async () => {
        return document.querySelector('.bootstrap-dialog-message').innerText;
      });

      console.log(error);

      logOut();
      throw new Error(`Ошибка при авторизации в Сетевую Инстанцию.\n\n${error ? error : ''}`);
    }

    // dist

    let addResults;

    if (distant) {
      await page.evaluate(async () => {
        // eslint-disable-next-line new-cap
        await SetSelectedTab(20, '/asp/Calendar/DayViewS.asp');
      });

      await page.waitForSelector('.schedule-table');

      await wait(1500, 1500);

      const Elements = [];

      await Promise.all([0, 1].map(async r => {
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

            const result = elements.map(r => {
              return Array.from(r.children).map(r => {
                return r.innerText;
              });
            });

            // console.log(result);

            return result;
          });

          Elements.push({
            lessons: elements,
            date: moment().add(r, 'days').format('DD.MM')
          });
          return;
        }, 14000 * r);
      }));

      await wait(20000, 20000);

      // console.log(Elements, 'elems');

      const results = Elements.map(r => {
        const schedule = r.lessons.map(r => {
          if (r[0] === 'Время' || r[0] === 'Уроки и мероприятия') return null;
          return `${r[0]} | ${r[1].replace('Урок: ', '')}`;
        }).filter(e => e);

        const result = {
          distant: true,
          schedule,
          date: r.date,
          totalLessons: schedule.length,
          startTime: schedule[0].split('-')[0].trim(),
          room: false,
          filename: `Расписание на ${r.date}`
        };

        return { status: true, distant: true, filename: `Расписание на ${r.date}`, result };
      });

      // console.log(results, 'res');

      addResults = results;
    }

    // dist

    await page.click('a[title="Объявления"]');

    // console.log('Объявления - found');

    // let homework = null;

    // await page.evaluate(async () => {
    //   const tbody = document.querySelector('.table').children[0];
    //   if (!tbody) return false;

    //   const elements = tbody.children;

    //   let nowDate = null;

    //   for (let i = 0; i < elements.length; i++) {
    //     if (elements[i].innerText === 'Срок сдачи\tПредмет\tТип задания\tТема задания\tОтметка') return;
    //     if (elements[i].className === 'visible-scr-row-sm') return nowDate = elements[i].innerText;
    //
    //   }
    // });

    // console.log('Объявления - clicked');

    await page.waitForSelector('.advertisement');

    // console.log('Объявления and advertisement - found');

    const files = await page.evaluate(async () => {
      const schedule = Array.from(document.querySelectorAll('.advertisement'))
          .filter(ad => ad.innerText.match(/расписание|изменения|расписании/g));
      // console.log(schedule);
      return await Promise.all(schedule.map(async r => {
        if (r.children[0].children[3].children.length === 0) return false;
        const arr = Array.from(r.children[0].children[3].children[0].children)
            .filter(e => e.localName === 'div');
        const links = await Promise.all(arr.map(rr => {
          return rr.children[0].children[0].href;
        }));

        const files = await Promise.all(links.map(async (r, i) => {
          let [link, num] = r.split(',');

          link = link.replace('javascript:openAttachment(\'', '');
          link = link.replace('\'', '');

          num = num.replace(');', '');
          num = Number(num.replace(' ', ''));

          // headless false only
          // setTimeout(async () => {
          //   await openAttachment(link, num);
          //   console.log('скачивается файл ', i);
          // }, 500 * i);

          return {
            link,
            num
          };
        }));

        return files;
      }));
    });

    // console.log(files);
    const cookiesArray = await page.cookies();

    const cookiesStrArray = await Promise.all(cookiesArray.map(r => {
      return `${r.name}=${r.value}`;
    }));

    const cookie = cookiesStrArray.join('; ');

    const at = await page.evaluate(() => {
      const element = document.querySelector('form[name="announcements"]');
      const inputElement = Array.from(element.children)
          .filter(r => r.localName === 'input' && r.name === 'AT');
      return inputElement[0].value;
    });

    const statuses = await Promise.all(files.filter(e => e).map(async r => {
      return await Promise.all(r.map(async (rr, i) => {
        // console.log('trying to download file');
        const statuses = await downloadFile({
          url: 'http://62.245.43.79' + rr.link,
          headers: {
            cookie,
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4469.0 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: qs.stringify({
            at,
            VER: Date.now(),
            attachmentId: rr.num
          }),
          i
        });

        return statuses;
      }));
    }));


    logOut();
    // console.log(statuses, 'ssssss');

    // console.log('statuses', statuses);

    if (distant) {
      addResults.map(r => {
        statuses[0].push(r);
      });
    }

    console.log('got schedule files');
    return statuses;
  } catch (error) {
    throw new Error(`Ошибка при получении файлов расписания из Сетевой Страны.\n\n${error}`);
  }
}

module.exports = loginAndGetSchedule;
