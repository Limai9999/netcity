const moment = require('moment');

const getAttachments = require('../modules/getAttachments');

function getLastMessages(messages, count, names = [], payload = false) {
  try {
    return messages.length >= count ? messages.slice(messages.length - count, messages.length).map(r => {
      const userId = names.find(e => e.userId === r.userId).name || r.userId;
      if (!payload && r.payload) return;

      const attachments = getAttachments(r.attachments);

      return `{ID:${r.msgId}} - ${userId}: ${r.message}${attachments} ${r.payload ? `(payload - ${r.payload.button});`: ''} ${r.date ? ` - [${moment(r.date).format('DD.MM HH:mm')}]`: ''}`.trim();
    }).filter(e => e) : messages.length > 0 && messages.length <= 1 ? getLastMessages(messages, messages.length, names, payload) : ['-'];
  } catch (error) {
    console.log('Ошибка при получении последних сообщений', error);
    return false;
  }
}

module.exports = getLastMessages;
