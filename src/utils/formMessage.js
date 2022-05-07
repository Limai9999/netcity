function formMessage(msgData) {
  const {attachments, text, peerId, senderId} = msgData;
  let message = text || '';

  if (attachments && attachments.length) {
    message += ' ' + attachments.map((attachment) => {
      const {type} = attachment;

      if (type === 'photo') {
        const {largeSizeUrl} = attachment;
        return `[Фото] - (${largeSizeUrl})`;
      }
      if (type === 'video') {
        const {title, ownerId, id} = attachment;
        return `[Видео] (${title}) - (https://vk.com/video${ownerId}_${id})`;
      }
      if (type === 'audio') {
        const {artist, title, duration, url} = attachment;
        return `[Аудио] (${artist} - ${title}) - (${duration} мин.) - (${url})`;
      }
      if (type === 'doc') {
        const {title, size, url} = attachment;
        return `[Документ] (${title}) - (${size} байт.) - (${url})`;
      }
      if (type === 'sticker') {
        const {images} = attachment;
        const {url} = images[images.length - 1];
        return `[Стикер] - (${url})`;
      }
      if (type === 'wall') {
        return '[Запись на стене]';
      }
      if (type === 'link') {
        return '[Ссылка]';
      }
      if (type === 'audio_message') {
        const {url} = attachment;
        return `[Аудиосообщение] - (${url})`;
      }
    }).filter((attachment) => attachment).join('\n');
  }

  return {message, peerId, senderId};
};

module.exports = formMessage;
