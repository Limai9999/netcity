// env config
require('dotenv').config();

const {connect} = require('mongoose');
const fs = require('fs');
const startAutoUpdate = require('./modules/startAutoUpdate');

const VKService = require('./services/VKService');
const ClassService = require('./services/ClassService');

// xuyita
const StatsService = require('./services/StatisticsService');
const stats = new StatsService();

const oldStats = require('./statistics.json');

const MONGODB_URL = process.env.MONGODB_URL;
connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (data) => {
  console.log(`Connected to Mongo DB - ${MONGODB_URL}`, '; error:', data);
  start();
});

async function start() {
  oldStats.map(({groupId, messages, attachments}) => {
    messages.map(async ({msgId, message, userId, command, payload}) => {
      await stats.addStatistics({
        peerId: groupId,
        fullMessage: null,
        messageId: msgId,
        text: message,
        attachments: attachments || null,
        date: null,
        userId,
        args: message.split(' '),
        commandName: command,
        payload: payload || null,
      });

      console.log(`${groupId}: ${msgId} ${message} ADDED TO STATS`);
    });
  });
  return;
};

// // Data

// const VK_TOKEN = process.env.VK_TOKEN;
// const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
// const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
// let IS_DEBUG = process.env.IS_DEBUG;
// IS_DEBUG === 'true' ? IS_DEBUG = true : IS_DEBUG = false;

// // Mongo DB


// // Commands
// const commands = [];

// const commandsDir = fs.readdirSync('./src/commands')
//     .filter((cmd) => cmd.endsWith('.js'));

// for (const commandFileName of commandsDir) {
//   const command = require(`./commands/${commandFileName}`);
//   commands.push(command);
// }

// // VK
// let vk;
// const classes = new ClassService({
//   isDebug: IS_DEBUG,
// });

// function start() {
//   vk = new VKService({
//     token: VK_TOKEN,
//     IS_DEBUG,
//     commands,
//     classes,
//     adminChat: ADMIN_CHAT_ID,
//     adminUserId: ADMIN_USER_ID,
//   });
//   vk.start().then(async (connection) => {
//     const allClasses = await classes.getAllClasses();
//     await Promise.all(allClasses.map(async (Class, index) => {
//       const id = Class.id;
//       await classes.setIntervalStatus(id, false);
//       await classes.setAlreadyGettingData(id, false);
//       await classes.cleanLastSentMessages(id);
//       await startAutoUpdate({id, vk, classes, index, IS_DEBUG});
//     }));

//     return startPolling(connection);
//   });
// }

// function startPolling(connection) {
//   console.log('Polling started');
//   connection.on('message_new', async (msgData) => {
//     let {messagePayload, peerId, conversationMessageId, text, senderId} = msgData;

//     text = text || '';
//     peerId = peerId.toString() || '';
//     senderId = senderId.toString() || '';
//     conversationMessageId = conversationMessageId.toString() || '';

//     text = text.replace(vk.getScreenName(), '').trim();
//     const args = text.split(/ +/) || [];
//     const commandName = args.shift().toLowerCase();

//     const isCanSendMessages = !(IS_DEBUG && senderId !== ADMIN_USER_ID);
//     await vk.handleMessage(msgData, args, commandName, isCanSendMessages);

//     const isPolling = await classes.isPolling(peerId);
//     if (!isPolling) return console.log('GOT MESSAGE WHILE NOT POLLING');

//     const command = commands.find((cmd) => {
//       const {aliases, name} = cmd;

//       if (messagePayload) {
//         return (aliases.includes(messagePayload.button) || aliases.includes(messagePayload.command));
//       }

//       return (aliases.includes(commandName) || name === commandName);
//     });

//     if (!command) return;

//     if (!isCanSendMessages) {
//       return vk.sendMessage({
//         message: 'Бот временно отключен. Попробуйте позже.',
//         peerId,
//       });
//     }

//     try {
//       // removing command's executor message
//       vk.removeMessageTimeout({
//         messageId: conversationMessageId,
//         peerId,
//         time: 4000000,
//         type: 'user',
//       });

//       const {name, requiredArgs, usingInfo, isGroupOnly, isInPMOnly, isAdminOnly, isHidden, continuteBanned} = command;
//       if (!isHidden) {
//         if (isAdminOnly) {
//           if (peerId != ADMIN_CHAT_ID) return false;
//         }
//         if (isGroupOnly) {
//           if (peerId < 2000000000) {
//             vk.sendMessage({
//               message: 'Эта команда работает только в беседе.',
//               peerId,
//             });
//             return false;
//           };
//         }
//         if (isInPMOnly) {
//           if (peerId > 2000000000) {
//             vk.sendMessage({
//               message: 'Эта команда работает только в личных сообщениях.',
//               peerId,
//             });
//             return false;
//           }
//         }
//       }

//       const {banned, reason} = await classes.isBanned(senderId, peerId);
//       if (!continuteBanned) {
//         if (banned) {
//           return vk.sendMessage({
//             message: `Вы не можете использовать эту команду, т.к вы заблокированы.\nПричина: ${reason}`,
//             peerId,
//             priority: 'low',
//           });
//         }
//       }

//       console.log('Command found, executing:', name);

//       if (args.length < requiredArgs) {
//         vk.sendMessage({
//           message: `Недостаточно аргументов.\n${usingInfo}`,
//           peerId,
//           priority: 'low',
//         });
//         return false;
//       }

//       command.execute({
//         vk,
//         classes,
//         args,
//         peerId,
//         userId: senderId,
//         payload: messagePayload,
//         banned: {banned, reason},
//       });
//     } catch (error) {
//       vk.sendMessage({
//         message: `Произошла ошибка при выполнении команды "${command.name}".\nОшибка: ${error.message}`,
//         peerId,
//         priority: 'high',
//       });
//       return console.log('COMMAND EXECUTE ERROR:', error);
//     }
//   });
// }
