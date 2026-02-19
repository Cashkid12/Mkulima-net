const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification type
  type: {
    type: String,
    required: true,
    enum: [
      'follower',      // Someone followed you
      'message',       // New 1-on-1 message
      'like',          // Someone liked your post
      'comment',       // Someone commented on your post
      'share',         // Someone shared your post
      'product_sale',  // Someone bought your product
      'product_like',  // Someone liked your product
      'product_comment', // Someone commented on your product
      'community',     // Community mention or activity
      'community_join', // Someone joined your community
      'job',           // Job-related notification
      'job_application', // Someone applied to your job
      'system'         // System announcements
    ]
  },
  
  // Source user (who triggered the notification)
  sourceUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Title and description
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Target object (what the notification is about)
  targetObject: {
    type: {
      type: String,
      enum: ['post', 'product', 'message', 'community', 'job', 'profile', 'user']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    },
    title: String,
    image: String
  },
  
  // Action link (where to navigate when clicked)
  actionLink: {
    type: String,
    required: true
  },
  
  // Read status
  read: {
    type: Boolean,
    default: false
  },
  
  readAt: {
    type: Date
  },
  
  // For batch operations
  batchId: {
    type: String,
    index: true
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isDeleted: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification.populate('sourceUser', 'username profilePicture farmName');
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    recipient: userId,
    read: false,
    isDeleted: false
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);

