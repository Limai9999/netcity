module.exports = (messages, amount, names = []) => {
  return messages.length >= amount ? messages.slice(messages.length - amount, messages.length).map(r => {
    const userId = names.find(e => e.userId === r.userId).name || r.userId;
    return `${userId}: ${r.message} ${r.payload ? `(payload - ${r.payload.button})`: ''}`.trim();
  }) : [`меньше ${amount} сообщений`];
};
