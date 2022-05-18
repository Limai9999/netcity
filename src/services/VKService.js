// Libraries
const {VK, Keyboard} = require('vk-io');

const axios = require('axios').default;
const fs = require('fs');
const FormData = require('form-data');

// Utils
const formMessage = require('../utils/formMessage');
// Modules
const randomEvent = require('../modules/randomEvent');

// Default keyboard
const defaultKeyboard = Keyboard.builder()
    .textButton({
      label: 'Получить расписание',
      payload: {button: 'getschedule'},
      color: Keyboard.POSITIVE_COLOR,
    })
    .textButton({
      label: 'Домашнее задание',
      payload: {button: 'gethomework'},
      color: Keyboard.POSITIVE_COLOR,
    })
    .row()
    .textButton({
      label: 'Обновить расписание',
      payload: {button: 'updateschedule'},
      color: Keyboard.NEGATIVE_COLOR,
    })
    .row()
    .textButton({
      label: 'Дополнительное меню',
      payload: {button: 'additionalmenu'},
      color: Keyboard.SECONDARY_COLOR,
    });

class VKService extends VK {
  constructor({token, IS_DEBUG = false, commands = [], adminChat = null, classes = null, statistics = null}) {
    super({token});
    this.IS_DEBUG = IS_DEBUG;
    this.token = token;
    this.isConnected = false;
    this.commands = commands;
    this.adminChat = adminChat;
    this.classes = classes;
    this.statistics = statistics;
    this.savedKeyboards = {};
  }

  start = async () => {
    try {
      await this.updates.start();

      this.isConnected = this.updates.isStarted;

      const conType = this.IS_DEBUG ? 'DEBUG' : 'PRODUCTION';
      console.log(`VK Longpoll connected in ${conType} as ${this.getScreenName()}, TOKEN: ${this.token}`);

      return this.updates;
    } catch (error) {
      console.log('VK Longpoll SERVICE ERROR:', error);
    }
  };

  isDebug = () => {
    return this.IS_DEBUG;
  };

  getDefaultKeyboard = () => {
    return defaultKeyboard;
  };

  checkIfVKIsConnected = () => {
    if (!this.isConnected) {
      throw new Error('VK is not connected');
    }
  };

  getVk = () => {
    this.checkIfVKIsConnected();
    return this;
  };

  getScreenName = () => {
    this.checkIfVKIsConnected();
    const {pollingGroupId} = this.updates.options;

    const screenName = `[club${pollingGroupId}|@${process.env.POLLING_BOT_USERNAME}]`;
    return screenName;
  };

  callApi = async (method, params) => {
    this.checkIfVKIsConnected();
    console.log('Calling API method:', method);
    const response = await this.api.call(method, params);

    if (response.error) {
      console.log('VK callApi ERROR:', response.error);
      return false;
    }

    return response;
  };

  getConversation = async (peerId) => {
    // https://dev.vk.com/method/messages.getConversationsById
    const response = await this.callApi('messages.getConversationsById', {
      peer_ids: peerId,
      extended: 1,
    });

    if (!response) return response;
    if (!response.count) return null;
    if (response.items[0].peer.type === 'user') return null;

    return response;
  };

  getConversationData = async (peerId) => {
    const response = await this.getConversation(peerId);
    if (!response) return response;

    return response.items[0].chat_settings;
  };

  getConversationMembers = async (peerId) => {
    // https://dev.vk.com/method/messages.getConversationMembers
    const response = await this.callApi('messages.getConversationMembers', {
      peer_id: peerId,
    });

    return response;
  };

  getCommands = () => {
    return this.commands;
  };

  getAdminChat = () => {
    return this.adminChat;
  };

  getBotId = () => {
    this.checkIfVKIsConnected();
    return this.updates.options.pollingGroupId;
  };

  randomId = () => {
    return Date.now() + Math.random().toString(5).substring(2, 8);
  };

  removeAllLastSentMessages = async (peerId, lastMessages = null) => {
    const lastSentMessages = lastMessages ? lastMessages : await this.classes.getLastSentMessages(peerId);

    await Promise.all(lastSentMessages.map(async (messageId) => {
      await this.removeMessage({messageId, peerId, type: 'bot'});
    }));
  };

  getMessagesUploadServer = async (peer_id) => {
    // https://vk.com/dev/photos.getMessagesUploadServer
    const result = await this.callApi('photos.getMessagesUploadServer', {peer_id});
    return result.upload_url;
  };

  uploadAndGetPhoto = async (photoPath, peer_id) => {
    const uploadServer = await this.getMessagesUploadServer(peer_id);
    const formData = new FormData();
    formData.append('photo', fs.createReadStream(photoPath));

    const uploadResult = await axios.post(uploadServer, formData, {
      headers: formData.getHeaders(),
    });

    const saveResult = this.savePhoto(uploadResult.data);
    return saveResult;
  };

  savePhoto = async ({photo, hash, server}) => {
    // https://vk.com/dev/photos.saveMessagesPhoto
    const result = await this.callApi('photos.saveMessagesPhoto', {
      photo,
      server,
      hash,
    });

    return result;
  };

  sendMessage = async ({message, peerId, keyboard, attachment, saveKeyboard = false, priority = 'dontdelete', type = 'bot'}) => {
    // https://dev.vk.com/method/messages.send
    try {
      if (type === 'bot') {
        const maxLastSentMessages = 15;
        const lastSentMessages = await this.classes.getLastSentMessages(peerId);
        console.log('lastSentMessages length:', lastSentMessages.length);
        if (lastSentMessages.length >= maxLastSentMessages) {
          this.sendMessage({
            message: 'Подождите...',
            peerId,
            type: 'user',
            priority: 'low',
          });

          await this.classes.setPolling(peerId, false);
          await this.removeAllLastSentMessages(peerId, lastSentMessages);
          await this.classes.setPolling(peerId, true);

          await this.sendMessage({
            message: `За короткий промежуток времени было отправлено больше ${maxLastSentMessages} сообщений.\nВсе предыдущие сообщения бота были удалены.`,
            peerId,
            type: 'user',
            priority: 'low',
          });
        }
      }

      if (saveKeyboard) this.savedKeyboards[peerId] = keyboard;
      const sendingKeyboard = keyboard ? keyboard : this.savedKeyboards[peerId] || this.getDefaultKeyboard();

      const response = await this.callApi('messages.send', {
        message,
        peer_ids: peerId,
        keyboard: sendingKeyboard,
        random_id: this.randomId(),
        attachment,
      });

      const messageId = response[0].conversation_message_id;
      type === 'bot' ? await this.classes.addLastSentMessage(messageId, peerId) : null;

      let removeTimeout = false;

      switch (priority) {
        case 'low':
          removeTimeout = 20 * 60 * 1000;
          break;
        case 'medium':
          removeTimeout = 60 * 60 * 1000;
          break;
        case 'high':
          removeTimeout = 4 * 60 * 60 * 1000;
          break;
      }

      if (removeTimeout) this.removeMessageTimeout({messageId, peerId, time: removeTimeout});

      return messageId;
    } catch (error) {
      console.log('VK SEND MESSAGE ERROR:', error);
      return false;
    }
  };

  removeMessageTimeout = ({messageId, peerId, time, type = 'bot'}) => {
    setTimeout(() => {
      console.log('removing message (timeout)');
      this.removeMessage({messageId, peerId, type});
    }, time);
  };

  removeMessage = async ({messageId, peerId, type = 'user'}) => {
    // https://dev.vk.com/method/messages.delete
    try {
      type === 'bot' ? await this.classes.removeLastSentMessage(messageId, peerId) : null;

      console.log('removing message', messageId, peerId);

      const response = await this.callApi('messages.delete', {
        conversation_message_ids: messageId,
        delete_for_all: 1,
        peer_id: peerId,
      });
      return response;
    } catch (error) {
      console.log('VK REMOVE MESSAGE ERROR:', error);
      return false;
    }
  };

  handleMessage = async (msgData, args, commandName, isCanSendMessages, isPolling) => {
    const {peerId, conversationMessageId, senderId, messagePayload} = msgData;
    // Saving message to statistic database
    await this.statistics.saveMessage(msgData, args, commandName);
    await this.classes.setUserLastSentMessage(peerId, conversationMessageId);

    // check if message redirect is enabled and if it is, redirect message to admin chat
    const isRedirect = await this.classes.isMessagesAreRedirecting(peerId);
    if (isRedirect) {
      const {message, peerId, senderId} = formMessage(msgData);
      this.sendMessage({
        message: `(${peerId}) - [id${senderId}|${senderId}]: ${message}`,
        peerId: this.getAdminChat(),
        type: 'user',
      });
    }

    if (!isPolling || !isCanSendMessages || messagePayload) return;
    // sending a random event
    const randomEventMessage = await randomEvent({
      vk: this,
      classes: this.classes,
      statistics: this.statistics,
      args,
      peerId,
      senderId,
      messagePayload,
    });

    if (randomEventMessage) {
      console.log(randomEventMessage);
      this.sendMessage({
        message: randomEventMessage,
        peerId,
        type: 'user',
      });
    }
  };
}

module.exports = VKService;
