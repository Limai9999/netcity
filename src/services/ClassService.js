const Class = require('../models/Class');

class ClassService {
  constructor({isDebug = false}) {
    this.isDebug = isDebug;
  }

  getClass = async (groupId = this.groupId) => {
    const classData = await Class.findOne({id: groupId});
    if (!classData) {
      console.log('class not added, creating...');
      await Class.create({id: groupId});
      console.log('class created');
      return await this.getClass(groupId);
    }
    return classData;
  };

  getAllClasses = async () => {
    const classes = await Class.find();
    return Array.from(classes);
  };

  save = async (data) => {
    // govno
    await data.save();
    console.log('Updated class data');
  };

  getUserLastSentMessage = async (groupId) => {
    const classData = await this.getClass(groupId);
    console.log(classData.lastUserSentMessage, 1);
    return classData.lastUserSentMessage;
  };

  setUserLastSentMessage = async (groupId, messageId) => {
    const classData = await this.getClass(groupId);
    console.log(messageId, 2);
    await classData.updateOne({
      $set: {lastUserSentMessage: messageId},
    });
  };

  addLastSentMessage = async (msgId, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $push: {lastSentMessages: msgId},
    });
  };

  removeLastSentMessage = async (msgId, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $pull: {lastSentMessages: msgId},
    });
    console.log(`removed ${msgId} last msg classes`);
  };

  getLastSentMessages = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.lastSentMessages;
  };

  cleanLastSentMessages = async (groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {lastSentMessages: []},
    });
  };

  isMessagesAreRedirecting = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.isMessagesRedirectEnabled;
  };

  toggleRedirect = async (groupId) => {
    const classData = await this.getClass(groupId);
    if (!classData) return null;
    await classData.updateOne({
      $set: {isMessagesRedirectEnabled: !classData.isMessagesRedirectEnabled},
    });
    return !classData.isMessagesRedirectEnabled;
  };

  setClassName = async (name, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {className: name},
    });
  };

  getClassName = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.className;
  };

  setNetCityData = async (groupId, data) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {netCityData: data},
    });
  };

  getNetCityData = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.netCityData;
  };

  isBanned = async (userId, groupId) => {
    const classData = await this.getClass(groupId);
    const user = classData.bannedUsers.find((user) => user.userId === userId);
    // console.log(user, user ? 'is banned' : 'is not banned');
    if (user) return {banned: true, reason: user.reason};
    return {banned: false};
  };

  addBannedUser = async (banData, groupId) => {
    const classData = await this.getClass(groupId);
    const isAlreadyBanned = await this.isBanned(banData.userId, groupId);
    if (isAlreadyBanned.banned) return false;
    await classData.updateOne({
      $push: {bannedUsers: banData},
    });
    return true;
  };

  removeBannedUser = async (userId, groupId) => {
    const classData = await this.getClass(groupId);
    const isAlreadyBanned = await this.isBanned(userId, groupId);
    if (!isAlreadyBanned) return false;
    await classData.updateOne({
      $pull: {bannedUsers: {userId}},
    });
    return true;
  };

  getSchedule = async (groupId) => {
    const classData = await this.getClass(groupId);
    return Array.from(classData.schedule);
  };

  getSpecificSchedule = async (groupId, filename) => {
    const classData = await this.getClass(groupId);
    const result = classData.schedule.find((schedule) => schedule.filename === filename);
    return result;
  };

  addSchedule = async (schedule, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $push: {schedule: schedule},
    });
  };

  getOldSchedule = async (groupId) => {
    const classData = await this.getClass(groupId);
    return Array.from(classData.oldSchedule);
  };

  addOldSchedule = async (schedule, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $push: {oldSchedule: schedule},
    });
  };

  cleanOldSchedule = async (groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {oldSchedule: []},
    });
  };

  getSpecificOldSchedule = async (groupId, filename) => {
    const classData = await this.getClass(groupId);
    const result = classData.oldSchedule.find((schedule) => schedule.filename === filename);
    return result;
  };

  cleanSchedule = async (groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {schedule: []},
    });
  };

  getLastDataUpdate = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.lastScheduleUpdate;
  };

  setLastDataUpdate = async (groupId, date) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {lastScheduleUpdate: date},
    });
  };

  setAlreadyGettingData = async (groupId, value) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {isGettingData: value},
    });
  };

  isGettingData = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.isGettingData;
  };

  getHomework = async (groupId) => {
    const classData = await this.getClass(groupId);
    return Array.from(classData.homework);
  };

  setHomework = async (homework, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {homework: homework},
    });
  };

  cleanHomework = async (groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {homework: []},
    });
  };

  setPolling = async (groupId, value) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {isPolling: value},
    });
  };

  isPolling = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.isPolling;
  };

  getIntervalStatus = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.intervalStatus;
  };

  setIntervalStatus = async (groupId, value) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {intervalStatus: value},
    });
  };

  setUsers = async (users, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {users: users},
    });
  };

  getUsers = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.users;
  };

  setGrades = async (grades, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {gradesData: grades},
    });
  };

  getGrades = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.gradesData;
  };

  setAverageGrades = async (grades, groupId) => {
    const classData = await this.getClass(groupId);
    await classData.updateOne({
      $set: {averageGrades: grades},
    });
  };

  getAverageGrades = async (groupId) => {
    const classData = await this.getClass(groupId);
    return classData.averageGrades;
  };
}

module.exports = ClassService;
