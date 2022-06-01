const getSummerInfo = require('../modules/getSummerInfo');

function howLongUntilSummer() {
  const {isNowSummer, timeUntilSummer: {days, hours, minutes, seconds}, timeToSummer} = getSummerInfo();

  let messages = [];

  if (isNowSummer) {
    messages = [
      `Ты знал что сейчас лето и до его конца осталось ${timeToSummer.days} дней?`,
      'вот это прикол оказывается сейчас лето',
      'ошалеть оказывается в данный момент лето',
      'завтра не в школу ура',
      `кст до конца лета ${timeToSummer.days} дней`,
      `кст до конца лета ${timeToSummer.minutes} минут`,
      `внимание прикол: до конца лета ${timeToSummer.seconds} секунд`,
    ];
  } else {
    messages = [
      `А вы знали что до начала лета осталось ${days} дней, ${hours % 60} часов и ${minutes % 60} минут?`,
      `Жееесть, до лета осталось целых ${days} дней.`,
      `Очень полезная информация: до лета осталось целых ${days} дней или ${minutes} минут.`,
      `ВНИМАНИЕ: до начала лета осталось ${seconds} секунд.`,
    ];
  }

  const message = messages[Math.floor(Math.random() * messages.length)];
  return message;
}

module.exports = howLongUntilSummer;
