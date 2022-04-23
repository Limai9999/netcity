module.exports = (groupId, classes) => {
  const Class = classes.find(e => e.groupId === groupId);
  Class.timeoutStarted = true;
  setTimeout(() => {
    if (Class.alreadyGetting || Class.timeoutStarted) return;
    Class.schedule = null;
    Class.alreadyGetting = false;
    Class.timeoutStarted = false;
  }, 600000);
};
