const axios = require('axios').default;

// Parameters
const lang = 'ru';
const units = 'metric';
const cityId = process.env.CITY_ID;
const apiKey = process.env.OPENWEATHER_APIKEY;

async function weatherEvent({senderId}) {
  const response = await axios({
    url: `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${apiKey}&lang=${lang}&units=${units}`,
  });
  if (!response) return false;
  const {data: {main: {temp}}} = response;

  const roundedTemp = Math.round(temp);

  const tempInWords = roundedTemp < -25 ? 'может сегодня не пойти в школу?' :
                      roundedTemp < -10 ? 'очень холодно' :
                      roundedTemp < 0 ? 'морозно' :
                      roundedTemp < 5 ? 'холодно' :
                      roundedTemp < 15 ? 'холодновато' :
                      roundedTemp < 22 ? 'тепло' :
                      'жарко жесть';

  const messages = [
    `А вы вообще знали, что в Екатеринбурге в данный момент ${roundedTemp}°C, по-моему ${tempInWords}?`,
    `У меня очень важная новость: в Екатеринбурге в данный момент ${roundedTemp}°C, мне кажется это ${tempInWords}!`,
    `А [id${senderId}|ты] вообще знал, что прямо сейчас в Екатеринбурге ${roundedTemp}°C, это же ${tempInWords}, да?`,
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];
  return message;
}

module.exports = weatherEvent;
