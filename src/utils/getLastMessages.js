const moment = require('moment');

module.exports = (messages, count, names = [], payload = false) => {
  try {
    return messages.length >= count ? messages.slice(messages.length - count, messages.length).map(r => {
      const userId = names.find(e => e.userId === r.userId).name || r.userId;
      if (!payload && r.payload) return;

      const attachments = r.attachments && r.attachments.length > 0 ? ' ' + r.attachments.map(attachment => {
        if (attachment.type === 'photo') {
          return `[Фото](${attachment.photo.sizes[attachment.photo.sizes.length - 1].url})`;
        } else if (attachment.type === 'sticker') {
          return `[Стикер](${attachment.sticker.images[attachment.sticker.images.length - 1].url})`;
        } else if (attachment.type === 'audio') {
          return `[Аудио](${attachment.audio.title} - ${attachment.audio.url})`;
        } else if (attachment.type === 'video') {
          return `[Видео](https://vk.com/video${attachment.video.owner_id}_${attachment.video.id})`;
        } else if (attachment.type === 'doc') {
          return `[Документ](${attachment.doc.url})`;
        } else if (attachment.type === 'wall') {
          return `[Запись на стене](https://vk.com/${attachment.wall.from.type === 'profile' ? 'id' : 'club'}${attachment.wall.from.id}?w=wall${attachment.wall.from.id}_${attachment.wall.id})`;
        } else if (attachment.type === 'link') {
          return `[Ссылка](${attachment.link.url})`;
        } else if (attachment.type === 'market') {
          return `[Товар]()`;
        } else if (attachment.type === 'market_album') {
          return `[Товары]()`;
        } else if (attachment.type === 'poll') {
          return `[Опрос](${attachment.poll.embed_hash})`;
        } else if (attachment.type === 'posted_photo') {
          return `[Posted Фото]()`;
        } else if (attachment.type === 'graffiti') {
          return `[Граффити]()`;
        } else if (attachment.type === 'audio_message') {
          return `[Аудио сообщение](${attachment.audio_message.link_mp3})`;
        } else if (attachment.type === 'gift') {
          return `[Подарок]()`;
        }
      }).join('\n') + ';' : '';

      return `{ID:${r.msgId}} - ${userId}: ${r.message}${attachments} ${r.payload ? `(payload - ${r.payload.button});`: ''} ${r.date ? ` - [${moment(r.date).format('DD.MM HH:mm')}]`: ''}`.trim();
    }).filter(e => e) : [`меньше ${count} сообщений`];
  } catch (error) {
    console.log('Ошибка при получении последних сообщений', error);
    return false;
  }
};

