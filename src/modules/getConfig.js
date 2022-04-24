const { readFileSync, writeFileSync } = require('fs');

module.exports = () => {
  let configFile = null;
  try {
    configFile = readFileSync('./src/data/config.json', 'utf-8');
  } catch (error) {
    const config = {
      'decryptKey': '',
      'vkToken': '',
      'adminChatId': '2000000002',
      'defaultKeyboard': {
        'buttons': [
          [
            {
              'action': {
                'type': 'text',
                'label': 'Получить расписание',
                'payload': '{"button":"getschedule"}'
              },
              'color': 'positive'
            }
          ],
          [
            {
              'action': {
                'type': 'text',
                'label': 'Обновить расписание',
                'payload': '{"button":"updateschedule"}'
              },
              'color': 'negative'
            }
          ]
        ],
        'inline': false,
        'one_time': false
      }
    };

    writeFileSync('./src/data/config.json', JSON.stringify(config));

    throw new Error('CREATED AND SAVED DEFAULT CONFIG, RESTART A BOT');
  }

  return JSON.parse(configFile);
};
