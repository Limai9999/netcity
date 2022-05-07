const Statistics = require('../models/Statistics');

class StatisticsService {
  saveMessage = async (msgData, args, commandName) => {
    const {peerId, conversationMessageId, message: {text, attachments}, createdAt, senderId, messagePayload, message} = msgData;
    const date = createdAt * 1000;
    const userId = senderId;
    const payload = messagePayload;
    const messageId = conversationMessageId;
    const fullMessage = message;
    const data = {
      peerId,
      fullMessage,
      messageId,
      text,
      attachments,
      date,
      userId,
      args,
      commandName,
      payload,
    };

    await Statistics.create(data);
    // console.log('Saved message');
  };
}

module.exports = StatisticsService;