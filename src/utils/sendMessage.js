const { stringify } = require('querystring');
const axios = require('axios');

const removeMessage = require('./removeMessage');

const { vkToken } = require('../data/config.json');

module.exports = async (message, peer_ids, additionallyData = null, userId = null, skip = false, importanceLevel = 'dontdelete') => {
  if (additionallyData && additionallyData.defaultKeyboard) {
    additionallyData.keyboard = JSON.stringify(additionallyData.defaultKeyboard);
    delete additionallyData.defaultKeyboard;
  }

  const data = stringify({
    v: 5.131,
    access_token: vkToken,
    peer_ids,
    random_id: Date.now() + Math.random().toString(5).substring(2, 8),
    message,
    ...additionallyData
  });

  const response = await axios.post(`https://api.vk.com/method/messages.send?${data}`);

  if (response.data.error) throw new Error(`Ошибка при отправке сообщения:\n${response.data.error.error_msg}`);

  if (importanceLevel === 'low') {
    setTimeout(() => {
      removeMessage(response.data.response[0].conversation_message_id, peer_ids);
    }, 1800000);
  } else if (importanceLevel === 'medium') {
    setTimeout(() => {
      removeMessage(response.data.response[0].conversation_message_id, peer_ids);
    }, 3600000);
  } else if (importanceLevel === 'high') {
    setTimeout(() => {
      removeMessage(response.data.response[0].conversation_message_id, peer_ids);
    }, 28800000);
  }

  // console.log(response.data);

  return response.data.response[0].conversation_message_id;
};
