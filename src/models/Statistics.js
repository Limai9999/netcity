const {Schema, model} = require('mongoose');

const StatisticsSchema = new Schema({
  peerId: {
    type: Number,
    required: true,
  },
  fullMessage: {
    type: Object,
  },
  messageId: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
  },
  attachments: {
    type: Array,
  },
  date: {
    type: Number,
  },
  userId: {
    type: Number,
    required: true,
  },
  args: {
    type: Array,
  },
  commandName: {
    type: String,
  },
  payload: {
    type: Object,
  },
}, {
  timestamps: true,
});

module.exports = model('Statistics', StatisticsSchema, 'statistics');
