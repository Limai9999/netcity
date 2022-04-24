const easyvk = require('easyvk');
const fs = require('fs');

const getConfig = require('./modules/getConfig');

const { config, classes } = getConfig();

// console.log(config.vkToken);

const removeMessage = require('./utils/removeMessage');
const sendMessage = require('./utils/sendMessage');

const addStats = require('./modules/addStats');
const startInterval = require('./modules/autoGetSchedule');

// const collection = new Map();
const commandsDir = fs.readdirSync('./src/commands')
    .filter(r => r.endsWith('.js'));

const commands = [];

for (const fileName of commandsDir) {
  const command = require(`./commands/${fileName}`);
  // collection.set(command.name, command);
  commands.push(command);
}

easyvk({
  token: config.vkToken,
  v: '5.131',
  save: false,
  utils: {
    bots: true
  }
}).then(async (vk) => {
  const connection = await vk.bots.longpoll.connect();
  vk.commands = commands;
  start(vk, connection);
});

function start(vk, connection) {
  connection.on('message_new', async ctx => {
    console.log('ctx', ctx);
    let { payload, text, peer_id, from_id, conversation_message_id, attachments } = ctx.message;

    const message = text.replace('[club202891784|@chechnyaltd]', '').trim();
    const groupId = peer_id.toString();
    const userId = from_id.toString();
    const conversationMessageId = conversation_message_id;

    console.log(groupId, message);

    // if (groupId !== '2000000002') return; // FOR TEST ONLY

    let args = message.trim().split(/ +/);

    let commandName = args.shift().toLowerCase();

    addStats({
      commandName,
      groupId,
      msgId: conversationMessageId,
      userId,
      message,
      payload,
      attachments
    });

    if (payload) {
      console.log(payload);
      payload = JSON.parse(payload);
      args = [];

      commandName = payload.button;
      if (payload.command) payload.button = payload.command;
    }

    const Class = classes.find(e => e.groupId === groupId);

    const defaultKeyboard = config.defaultKeyboard;

    try {
      const command = commands.find(cm => cm.name.includes(commandName));
      if (command) {
        console.log(`used command: ${command.name[0]}, ${groupId}, ${userId}, ${conversationMessageId}`);

        setTimeout(() => {
          removeMessage(conversationMessageId, groupId);
        }, 4000000);

        return command.execute(vk, config, Class, classes, message, args, groupId, userId, conversationMessageId, defaultKeyboard, payload);
      }
    } catch (error) {
      console.log('index.js command error', error);
      await sendMessage(`вышла ошибочка\n${error}`, groupId, { defaultKeyboard }, userId, null, 'high');
    }
  });
}

for (let i = 0; i < classes.length; i++) {
  const Class = classes[i];
  Class.alreadyGetting = false;
  Class.timeoutStarted = false;
  Class.schedule = null;
  Class.lastUpdate = false;
  Class.lastSeenSchedule = null;
  Class.oldSchedule = [];

  // lastSeens.push({groupId: config.classes[i].groupId, timeout: null});

  startInterval(Class.groupId, classes);
}

require('./modules/autoSaveConfig')(classes);
