const sendMessage = require('../utils/sendMessage');

const getUsernames = require('../utils/getUsernames');

let names = [];

module.exports = async (message, Class, adminId, userId, vk, stats) => {
  if (!Class || !Class.enableRedirect) return console.log(1);

  if (names.length === 0) {
    names = await getUsernames(vk, stats);
  }

  const { name } = names.find(e => e.userId == userId) || { name: 'неизв.'};

  const result = `${Class.groupId}, ${name}: ${message}`;

  sendMessage(result, adminId, {}, userId, null, 'low');
};
