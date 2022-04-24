const axios = require('axios');
const { stringify } = require('querystring');

const { vkToken } = require('../data/config.json');

module.exports = async (conversation_message_ids, peer_id) => {
  try {
    if (!peer_id.startsWith('200000')) return;
    const data = stringify({
      v: 5.131,
      access_token: vkToken,
      peer_id,
      delete_for_all: 1,
      conversation_message_ids
    });

    try {
      await axios.post(`https://api.vk.com/method/messages.delete?${data}`);
    } catch (error) {
      console.log('error while removing message', peer_id, conversation_message_ids);
    }
    // console.log(result.data);
    return;
  } catch (error) {
    console.log('Ошибка при удалении сообщения', peer_id, conversation_message_ids, error);
    return false;
  }
};
