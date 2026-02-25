const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    required: false
  },
  fileName: {
    type: String,
    required: false
  },
  readStatus: {
    type: Map,
    of: Boolean,
    default: {}
  },
  repliedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ conversationId: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);