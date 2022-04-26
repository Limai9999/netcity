const sendMessage = require('../utils/sendMessage');

const getUsernames = require('../utils/getUsernames');

let names = [];

const getAttachments = require('../modules/getAttachments');

module.exports = async (message, Class, adminId, userId, vk, stats) => {
  if (!Class || !Class.enableRedirect) return;

  if (names.length === 0) {
    names = await getUsernames(vk, stats);
  }

  const attachments = getAttachments(message.attachments);

  const { name } = names.find(e => e.userId == userId) || { name: 'неизв.'};

  const result = `${Class.groupId}, ${name}: ${message.text}${attachments}`;

  sendMessage(result, adminId, {}, userId, null, 'low');
};
