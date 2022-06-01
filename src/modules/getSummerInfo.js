function calculateTime({month, day}) {
  const todayTime = new Date();
  const calcTime = new Date(todayTime.getFullYear(), month - 1, day);
  const millisecondsTime = calcTime - todayTime;

  let days = Math.floor(millisecondsTime / (1000 * 60 * 60 * 24));
  let hours = Math.floor(millisecondsTime / (1000 * 60 * 60));
  let minutes = Math.floor(millisecondsTime / (1000 * 60));
  let seconds = Math.floor(millisecondsTime / 1000);

  days < 0 ? days = 0 : days;
  hours < 0 ? hours = 0 : hours;
  minutes < 0 ? minutes = 0 : minutes;
  seconds < 0 ? seconds = 0 : seconds;

  return {days, hours, minutes, seconds};
}

function getSummerInfo() {
  const timeUntilSummer = calculateTime({month: 6, day: 1});
  const timeToSummer = calculateTime({month: 9, day: 1});

  const result = {
    isNowSummer: timeUntilSummer.seconds === 0,
    timeUntilSummer,
    timeToSummer,
  };

  return result;
}

module.exports = getSummerInfo;
