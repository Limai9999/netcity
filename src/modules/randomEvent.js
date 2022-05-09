const {readdirSync} = require('fs');

const events = [];
const eventsDir = readdirSync('./src/MessageEvents')
    .filter((event) => event.endsWith('.js'));

for (const eventFileName of eventsDir) {
  const event = require(`../MessageEvents/${eventFileName}`);
  events.push(event);
}

async function randomEvent({vk, classes, args, peerId, senderId, messagePayload, recursedTimes = 0}) {
  if (recursedTimes > 3) return false;
  const trueProbability = 0.07;
  const playEvent = Math.random() < trueProbability;
  // console.log('playEvent', playEvent);
  if (!playEvent) return;

  const event = events[Math.floor(Math.random() * events.length)];
  if (!event) return;
  const message = await event({vk, classes, args, peerId, senderId, messagePayload});

  return message;
}

module.exports = randomEvent;
