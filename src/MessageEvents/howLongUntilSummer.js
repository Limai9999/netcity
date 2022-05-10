function howLongUntilSummer() {
  // посчитать сколько дней осталось до 31 мая
  const summer = {
    month: 6,
    day: 1,
  };

  const todayTime = new Date();
  const summerTime = new Date(todayTime.getFullYear(), summer.month - 1, summer.day);
  const millisecondsTime = summerTime - todayTime;

  let days = Math.floor(millisecondsTime / (1000 * 60 * 60 * 24));
  let hours = Math.floor(millisecondsTime / (1000 * 60 * 60));
  let minutes = Math.floor(millisecondsTime / (1000 * 60));
  let seconds = Math.floor(millisecondsTime / 1000);

  days < 0 ? days = 0 : days;
  hours < 0 ? hours = 0 : hours;
  minutes < 0 ? minutes = 0 : minutes;
  seconds < 0 ? seconds = 0 : seconds;

  if (seconds === 0) {
    return 'Лето уже наступило!';
  }

  const messages = [
    `Кстати, вы знали что до начала лета осталось ${days} дней, ${hours % 60} часов и ${minutes % 60} минут?`,
    `Жееесть, до лета осталось целых ${days} дней.`,
    `Очень полезная информация: до лета осталось целых ${days} дней или ${minutes} минут.`,
    `ВНИМАНИЕ: до начала лета осталось ${seconds} секунд.`,
  ];

  const message = messages[Math.floor(Math.random() * messages.length)];
  return message;
}

module.exports = howLongUntilSummer;
