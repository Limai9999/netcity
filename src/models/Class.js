const {Schema, model} = require('mongoose');

const ClassSchema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  className: {
    type: String,
  },
  notes: {
    type: Array,
  },
  homework: {
    type: Array,
  },
  schedule: {
    type: Array,
  },
  oldSchedule: {
    type: Array,
  },
  lastScheduleUpdate: {
    type: Number,
    default: 0,
  },
  isGettingData: {
    type: Boolean,
    default: false,
  },
  intervalStatus: {
    type: Boolean,
    default: false,
  },
  netCityData: {
    type: Object,
    default: {login: null, password: null},
  },
  isMessagesRedirectEnabled: {
    type: Boolean,
    default: false,
  },
  bannedUsers: {
    type: Array,
  },
  users: {
    type: Array,
  },
  lastSentMessages: {
    type: Array,
  },
  lastUserSentMessage: {
    type: Number,
    default: 0,
  },
  isPolling: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = model('Class', ClassSchema, 'classes');
