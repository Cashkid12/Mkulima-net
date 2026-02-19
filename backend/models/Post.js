const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Post content cannot exceed 1000 characters']
  },
  media: [{
    type: String // Cloudinary URL for images/videos
  }],
  productsTagged: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  servicesTagged: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service' // Assuming we have a Service model
  }],
  communitiesTagged: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  }],
  location: {
    type: String // County/farm location
  },
  visibility: {
    type: String,
    enum: ['public', 'followers', 'community'],
    default: 'public'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  sharesCount: {
    type: Number,
    default: 0
  },
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient querying
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);