const classesConfig = require('../data/classes.json');

const { writeFileSync } = require('fs');

const defaultClass = {
  groupId: null,
  className: null,
  notes: null,
  homework: null,
  lastUpdate: null,
  schedule: null,
  oldSchedule: null,
  alreadyGetting: false,
  timeoutStarted: false,
  username: null,
  password: null,
  lastSeenSchedule: null,
  enableRedirect: false,
  bannedUsers: [],
  lastSentSchedules: []
};

function addPropertiesToClasses(classes = classesConfig) {
  const data = classes.map(classItem => {
    // get props of object
    const classProps = Object.keys(classItem);
    // get props of default object
    const defaultProps = Object.keys(defaultClass);
    // get props that are not in classItem Object
    const propsToAdd = defaultProps.filter(prop => !classProps.includes(prop));
    // add props to classItem Object
    propsToAdd.forEach(prop => {
      classItem[prop] = defaultClass[prop];
    });
    return classItem;
  });

  writeFileSync('./src/data/classes.json', JSON.stringify(data));
  console.log('classes updated');
}

module.exports = addPropertiesToClasses;
