const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  deviceInfo: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ token: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Session', SessionSchema);
