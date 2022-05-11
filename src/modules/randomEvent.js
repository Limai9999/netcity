const {readdirSync} = require('fs');

const events = [];
const eventsDir = readdirSync('./src/MessageEvents')
    .filter((event) => event.endsWith('.js'));

for (const eventFileName of eventsDir) {
  const event = require(`../MessageEvents/${eventFileName}`);
  events.push(event);
}

async function randomEvent({vk, classes, statistics, args, peerId, senderId, messagePayload, recursedTimes = 0}) {
  // рандомнное событие из папки MessageEvents
  if (recursedTimes > 3) return false;
  let trueProbability = 0.03;
  let playEvent = Math.random() < trueProbability;
  // console.log('playEvent', playEvent);
  if (playEvent) {
    const event = events[Math.floor(Math.random() * events.length)];
    if (!event) return;
    const message = await event({vk, classes, args, peerId, senderId, messagePayload});

    return message;
  }

  // если нет события, пишется рандомное сообщение, которое уже ктото писал
  trueProbability = 0.2;
  playEvent = Math.random() < trueProbability;
  if (!playEvent) return;
  const allMessages = await statistics.getMessagesWithoutPayload(peerId);
  const filtered = allMessages.filter(({text, args}) => text.length >= 10 && args.length >= 1);
  if (!filtered.length) return;

  const {text} = filtered[Math.floor(Math.random() * filtered.length)];
  const textArray = text.split(' ');

  // take random elements from textArray
  let randomElements = [];
  for (let i = 0; i < textArray.length; i++) {
    if (Math.random() < 0.7) {
      randomElements.push(textArray[i]);
    }
  }

  const randomIndex = Math.floor(Math.random() * textArray.length);
  !randomElements.length ? randomElements = [textArray[randomIndex]] : null;

  const message = randomElements.join(' ');

  console.log(message);

  return message;
}

module.exports = randomEvent;
