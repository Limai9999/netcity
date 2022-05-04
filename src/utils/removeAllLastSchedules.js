const removeMessage = require('./removeMessage');

async function removeAllLastSchedules(lastMsgs, peer_id) {
  for (let i = 0; i < lastMsgs.length; i++) {
    // remove message from vk
    console.log('removed', lastMsgs[i], peer_id);
    await removeMessage(lastMsgs[i], peer_id);
  }

  return lastMsgs.length;
}

module.exports = removeAllLastSchedules;
