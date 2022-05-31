const getDataFromNetCity = require('./netcity/getData');
const getAndHandleGrades = require('./netcity/getAndHandleGrades');

async function startAutoUpdate({id, vk, classes, index = null, IS_DEBUG = false}) {
  return false;

  return new Promise(async (resolve) => {
    const isGroup = id > 2000000000;

    const isIntervalStarted = await classes.getIntervalStatus(id);
    if (isIntervalStarted) {
      console.log(`Interval for ${id} already started.`);
      return resolve();
    }

    const {login, password} = await classes.getNetCityData(id);
    const className = await classes.getClassName(id);

    if (!login || !password) return resolve();

    if (!index && index !== 0) {
      const Classes = await classes.getAllClasses(id);
      const intervalClasses = Classes.filter(({intervalStatus}) => intervalStatus);
      console.log(`Started auto update for non-indexed class. Total intervaled classes: ${intervalClasses.length}`);
      index = intervalClasses.length + 1;
    }

    let updateInterval = (20 + index || 0) * 60 * 1000;
    if (!isGroup) updateInterval = (120 + (index * 3)) * 60 * 1000;

    if (className && isGroup) {
      await classes.setIntervalStatus(id, true);
      setInterval(() => {
        getDataFromNetCity({vk, classes, peerId: id, IS_DEBUG, isGroup});
      }, updateInterval);
      console.log(`Started auto update for CLASS: ${className} (${id}), with time interval: ${updateInterval}`);
    }

    if (!isGroup) {
      // const interval = updateInterval + 120 * 1000;
      await classes.setIntervalStatus(id, true);

      setInterval(() => {
        getAndHandleGrades({vk, classes, login, password, peerId: id, isDebug: IS_DEBUG, shouldUpdate: true});
      }, updateInterval);
      console.log(`Started GRADES auto update for USER: ${id}, with time interval: ${updateInterval}`);
    }
    return resolve();
  });
}

module.exports = startAutoUpdate;
