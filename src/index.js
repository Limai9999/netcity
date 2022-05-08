// env config
require('dotenv').config();

const {connect} = require('mongoose');
const fs = require('fs');
const startAutoUpdate = require('./modules/startAutoUpdate');

const VKService = require('./services/VKService');
const ClassService = require('./services/ClassService');

// Data
const MONGODB_URL = process.env.MONGODB_URL;
const VK_TOKEN = process.env.VK_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

// Mongo DB
connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (data) => {
  console.log(`Connected to Mongo DB - ${MONGODB_URL}`, '; error:', data);
  start();
});

// Commands
const commands = [];

const commandsDir = fs.readdirSync('./src/commands')
    .filter((cmd) => cmd.endsWith('.js'));

for (const commandFileName of commandsDir) {
  const command = require(`./commands/${commandFileName}`);
  commands.push(command);
}

// VK
let vk;
const classes = new ClassService();

function start() {
  vk = new VKService({
    token: VK_TOKEN,
    test: false,
    commands,
    classes,
    adminChat: ADMIN_CHAT_ID,
  });
  vk.start().then(async (connection) => {
    const allClasses = await classes.getAllClasses();
    await Promise.all(allClasses.map(async (Class, index) => {
      const id = Class.id;
      await classes.setIntervalStatus(id, false);
      await classes.setAlreadyGettingData(id, false);
      await classes.cleanLastSentMessages(id);
      await startAutoUpdate({id, vk, classes, index});
    }));

    return startPolling(connection);
  });
}

function startPolling(connection) {
  console.log('Polling started');
  connection.on('message_new', async (msgData) => {
    // console.log(msgData);
    let {messagePayload, peerId, conversationMessageId, text, senderId} = msgData;
    text = text || '';
    peerId = peerId.toString() || '';
    senderId = senderId.toString() || '';
    conversationMessageId = conversationMessageId.toString() || '';

    text = text.replace(vk.getScreenName(), '').trim();
    const args = text.split(/ +/) || [];
    const commandName = args.shift().toLowerCase();

    await vk.handleMessage(msgData, args, commandName);

    const isPolling = await classes.isPolling(peerId);
    if (!isPolling) return console.log('GOT MESSAGE WHILE NOT POLLING');

    const command = commands.find((cmd) => {
      const {aliases, name} = cmd;

      if (messagePayload) {
        return (aliases.includes(messagePayload.button) || aliases.includes(messagePayload.command));
      }

      return (aliases.includes(commandName) || name === commandName);
    });

    if (!command) return;

    try {
      // removing command's executor message
      vk.removeMessageTimeout({
        messageId: conversationMessageId,
        peerId,
        time: 4000000,
        type: 'user',
      });

      const {name, requiredArgs, usingInfo, isGroupOnly, isInPMOnly, isAdminOnly, isHidden, continuteBanned} = command;
      if (!isHidden) {
        if (isAdminOnly) {
          if (peerId != ADMIN_CHAT_ID) return false;
        }
        if (isGroupOnly) {
          if (peerId < 2000000000) {
            vk.sendMessage({
              message: 'Эта команда работает только в беседе.',
              peerId,
            });
            return false;
          };
        }
        if (isInPMOnly) {
          if (peerId > 2000000000) {
            vk.sendMessage({
              message: 'Эта команда работает только в личных сообщениях.',
              peerId,
            });
            return false;
          }
        }
      }

      const {banned, reason} = await classes.isBanned(senderId, peerId);
      if (!continuteBanned) {
        if (banned) {
          return vk.sendMessage({
            message: `Вы не можете использовать эту команду, т.к вы заблокированы.\nПричина: ${reason}`,
            peerId,
            priority: 'low',
          });
        }
      }

      console.log('Command found, executing:', name);

      if (args.length < requiredArgs) {
        vk.sendMessage({
          message: `Недостаточно аргументов.\n${usingInfo}`,
          peerId,
          priority: 'low',
        });
        return false;
      }

      command.execute({
        vk,
        classes,
        args,
        peerId,
        userId: senderId,
        payload: messagePayload,
        banned: {banned, reason},
      });
    } catch (error) {
      vk.sendMessage({
        message: `Произошла ошибка при выполнении команды "${command.name}".\nОшибка: ${error.message}`,
        peerId,
        priority: 'high',
      });
      return console.log('COMMAND EXECUTE ERROR:', error);
    }
  });
}
