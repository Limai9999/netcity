const { readFileSync, writeFileSync } = require('fs');

module.exports = () => {
  let configFile = null;
  let classesFile = null;
  let statisticsFile = null;
  try {
    configFile = readFileSync('./src/data/config.json', 'utf-8');
    classesFile = readFileSync('./src/data/classes.json', 'utf-8');
    statisticsFile = readFileSync('./src/data/statistics.json', 'utf-8');
  } catch (error) {
    if (!configFile) {
      const config = {
        'decryptKey': 'decryptKey',
        'vkToken': 'vktoken',
        'testVKToken': 'vktoken',
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
    }

    if (!classesFile) {
      const classes = [];

      writeFileSync('./src/data/classes.json', JSON.stringify(classes));
    }

    if (!statisticsFile) {
      const statistics = [];

      writeFileSync('./src/data/statistics.json', JSON.stringify(statistics));
    }

    throw new Error('CREATED AND SAVED DEFAULT CONFIGS, RESTART A BOT');
  }

  return {
    config: JSON.parse(configFile),
    classes: JSON.parse(classesFile),
    statistics: JSON.parse(statisticsFile)
  };
};
