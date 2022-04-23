const getSchedule = require('./getSchedule');

module.exports = async (groupId, classes) => {
  const Class = classes.find(e => e.groupId === groupId);

  setInterval(async () => {
    if (Class.alreadyGetting) return;
    Class.alreadyGetting = false;

    Class.schedule = await getSchedule(groupId, classes);
  }, 900000 + Math.floor(Math.random() * (120000 - 60000) ));
};
