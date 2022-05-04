const TEST = false;

const { stringify } = require('querystring');
const axios = require('axios');

const removeMessage = require('./removeMessage');
const removeAllLastSchedules = require('./removeAllLastSchedules');

const { vkToken, testVKToken } = require('../data/config.json');

const token = TEST ? testVKToken : vkToken;

async function sendMessage(message, peer_ids, additionallyData = null, userId = null, skip = false, importanceLevel = 'dontdelete', Class = null) {
  try {
    if (additionallyData && additionallyData.defaultKeyboard) {
      additionallyData.keyboard = JSON.stringify(additionallyData.defaultKeyboard);
      delete additionallyData.defaultKeyboard;
    }

    if (Class) {
      const lssLength = Class.lastSentSchedules.length;

      // cleaning if there are more than 7 last sent schedules
      if (lssLength >= 5) {
        console.log('more than 5');
        await removeAllLastSchedules(Class.lastSentSchedules, peer_ids);
        // remove all elements from array
        Class.lastSentSchedules.splice(0, lssLength);

        // send message to vk about cleaning
        const msg = 'За короткий промежуток времени было отправлено много сообщений с расписанием. Предыдущие сообщения были удалены.';
        sendMessage(msg, peer_ids, { defaultKeyboard: Class.defaultKeyboard }, userId, true, 'low');
      }

      // if (bannedTryedUse) {
      //   await removeAllSchedules();
      //   sendMessage('Вы забанены, поэтому все недавно отправленные расписания удалены.', peer_ids, { defaultKeyboard: Class.defaultKeyboard }, userId, true, 'low');
      // }
    }

    const data = stringify({
      v: 5.131,
      access_token: token,
      peer_ids,
      random_id: Date.now() + Math.random().toString(5).substring(2, 8),
      message,
      ...additionallyData
    });

    const response = await axios.post(`https://api.vk.com/method/messages.send?${data}`);

    if (response.data.error) throw new Error(`Ошибка при отправке сообщения:\n${response.data.error.error_msg}`);

    if (importanceLevel === 'low') {
      setTimeout(() => {
        removeMessage(response.data.response[0].conversation_message_id, peer_ids, Class);
      }, 1800000);
    } else if (importanceLevel === 'medium') {
      setTimeout(() => {
        removeMessage(response.data.response[0].conversation_message_id, peer_ids, Class);
      }, 3600000);
    } else if (importanceLevel === 'high') {
      setTimeout(() => {
        removeMessage(response.data.response[0].conversation_message_id, peer_ids, Class);
      }, 28800000);
    }

    // console.log(response.data);

    return response.data.response[0].conversation_message_id;
  } catch (error) {
    console.log('Ошибка при отправке сообщения:', peer_ids, error);
    return false;
  }
}

module.exports = sendMessage;
