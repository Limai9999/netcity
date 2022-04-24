/* eslint-disable max-len */
const statistics = require('../data/statistics.json');
const { writeFileSync } = require('fs');

module.exports = ({command, groupId, msgId, userId, message, payload, attachments}) => {
  let groupElement = statistics.find(e => e.groupId === groupId);

  if (!groupElement) {
    statistics.push({ groupId, totalMessages: 0, commandsExecuted: 0, messages: [] });
    groupElement = statistics.find(e => e.groupId === groupId);
  }

  groupElement.messages.push({ command, msgId, userId, message, attachments, payload: payload ? JSON.parse(payload) : false, date: Date.now() });
  groupElement.totalMessages = msgId;

  if (payload) {
    groupElement.commandsExecuted += 1;
  }

  writeFileSync('./src/data/statistics.json', JSON.stringify(statistics));
};
