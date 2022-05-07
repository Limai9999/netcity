module.exports = (min, max, log = true) => {
  return new Promise((resolve) => {
    const randomMs = Math.floor(Math.random() * (max - min) ) + min;
    if (log) console.log('waiting', randomMs);
    setTimeout(resolve, randomMs);
  });
};
