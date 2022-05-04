const removeMessage = require('./removeMessage');

function removeAllLastSchedules(lastMsgs, peer_id) {
  for (let i = 0; i < lastMsgs.length; i++) {
    // remove message from vk
    console.log(lastMsgs[i], peer_id);
    removeMessage(lastMsgs[i], peer_id);
  }
}

module.exports = removeAllLastSchedules;
