const getSchedule = require('./getSchedule');

module.exports = async (groupId, classes) => {
  const Class = classes.find(e => e.groupId === groupId);

  setInterval(async () => {
    if (Class.alreadyGetting) return;
    Class.alreadyGetting = false;

    const result = await getSchedule(groupId, classes);
    Class.schedule = result.statuses;
    Class.homework = result.homework;
  }, 900000 + Math.floor(Math.random() * (120000 - 60000) ));
};
