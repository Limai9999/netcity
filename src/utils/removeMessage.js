const TEST = false;

const axios = require('axios');
const { stringify } = require('querystring');

const { vkToken, testVKToken } = require('../data/config.json');

const token = TEST ? testVKToken : vkToken;

module.exports = async (conversation_message_ids, peer_id, Class) => {
  const msgId = conversation_message_ids.toString();

  try {
    if (!peer_id.startsWith('200000')) return;
    const data = stringify({
      v: 5.131,
      access_token: token,
      peer_id,
      delete_for_all: 1,
      conversation_message_ids: msgId
    });

    try {
      console.log('removing');
      if (Class) {
        // remove conversation_message_ids from Class.lastSentSchedules
        Class.lastSentSchedules = Class.lastSentSchedules.filter(id => msgId.indexOf(id) === -1);
      }
      await axios.post(`https://api.vk.com/method/messages.delete?${data}`);
    } catch (error) {
      console.log('error while removing message', peer_id, msgId);
      console.log(error);
    }
    // console.log(result.data);
    return;
  } catch (error) {
    console.log('Ошибка при удалении сообщения', peer_id, msgId, error);
    return false;
  }
};
