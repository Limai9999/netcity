const getDataFromNetCity = require('./getDataFromNetCity');

async function startAutoUpdate({id, vk, classes, index = null}) {
  if (id < 2000000000) return;

  const {login, password} = await classes.getNetCityData(id);
  const className = await classes.getClassName(id);

  if (!index) {
    const Classes = await classes.getAllClasses(id);
    index = Classes.length;
  }

  if (!login || !password || !className) return;

  const updateInterval = (20 + index || 0) * 60 * 1000;

  console.log(`Started auto update for class: ${className} (${id}), with time interval: ${updateInterval}`);

  setInterval(() => {
    getDataFromNetCity({login, password, className, vk, classes, peerId: id});
  }, updateInterval);
}

module.exports = startAutoUpdate;
