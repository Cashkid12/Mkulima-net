const mongoose = require('mongoose');

const UsernameHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
UsernameHistorySchema.index({ userId: 1, changedAt: -1 });

module.exports = mongoose.model('UsernameHistory', UsernameHistorySchema);
