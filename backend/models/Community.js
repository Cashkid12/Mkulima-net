const mongoose = require('mongoose');

const communityMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  }
});

const communityMessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  mediaUrl: {
    type: String
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Community name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'crops',
      'livestock',
      'irrigation',
      'organic',
      'equipment',
      'general',
      'market',
      'education'
    ]
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  image: {
    type: String
  },
  location: {
    county: String,
    town: String
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [communityMemberSchema],
  messages: [communityMessageSchema],
  rules: [{
    type: String,
    trim: true
  }],
  pinnedMessage: {
    type: communityMessageSchema
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Index for efficient querying
communitySchema.index({ category: 1, createdAt: -1 });
communitySchema.index({ type: 1, createdAt: -1 });
communitySchema.index({ 'members.user': 1 });
communitySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Community', communitySchema);
