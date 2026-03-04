const mongoose = require('mongoose');

const OtpCodeSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient cleanup of expired codes
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpCodeSchema.index({ phone: 1, createdAt: -1 });

module.exports = mongoose.model('OtpCode', OtpCodeSchema);
