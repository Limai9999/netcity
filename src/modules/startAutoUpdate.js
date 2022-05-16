const getDataFromNetCity = require('./netcity/getDataFromNetCity');

async function startAutoUpdate({id, vk, classes, index = null, IS_DEBUG = false}) {
  if (id < 2000000000) return;

  const isIntervalStarted = await classes.getIntervalStatus(id);
  if (isIntervalStarted) return console.log(`Interval for ${id} already started.`);

  const {login, password} = await classes.getNetCityData(id);
  const className = await classes.getClassName(id);

  if (!index) {
    const Classes = await classes.getAllClasses(id);
    index = Classes.length + 1;
  }

  if (!login || !password || !className) return;

  const updateInterval = (20 + index || 0) * 60 * 1000;

  console.log(`Started auto update for class: ${className} (${id}), with time interval: ${updateInterval}`);

  await classes.setIntervalStatus(id, true);

  setInterval(() => {
    getDataFromNetCity({vk, classes, peerId: id, IS_DEBUG});
  }, updateInterval);
}

module.exports = startAutoUpdate;
