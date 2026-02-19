const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 4
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  farmName: {
    type: String,
    trim: true,
    default: ''
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  },
  // Analytics fields
  postsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  // Saved posts
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'supplier', 'admin'],
    default: 'farmer'
  },
  verified: {
    type: Boolean,
    default: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // Privacy settings
  twoFactorAuth: {
    type: Boolean,
    default: false
  },
  showOnlineStatus: {
    type: Boolean,
    default: true
  },
  allowFollowRequests: {
    type: Boolean,
    default: true
  },
  
  // Notification settings
  notificationSettings: {
    push: {
      followers: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      marketplace: { type: Boolean, default: true },
      posts: { type: Boolean, default: true },
      communities: { type: Boolean, default: true },
      jobs: { type: Boolean, default: true }
    },
    email: {
      followers: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      marketplace: { type: Boolean, default: false },
      posts: { type: Boolean, default: true },
      communities: { type: Boolean, default: false },
      jobs: { type: Boolean, default: true }
    },
    inApp: { type: Boolean, default: true },
    sound: { type: Boolean, default: true }
  },
  
  // Marketplace settings
  marketplaceSettings: {
    defaultVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    defaultCategory: { type: String, default: 'crops' },
    priceUnit: { type: String, enum: ['KES', 'USD'], default: 'KES' },
    autoRefresh: { type: Boolean, default: true },
    sortPreference: { type: String, enum: ['freshness', 'relevance', 'price'], default: 'freshness' }
  },
  
  // Feed settings
  feedSettings: {
    showSuggestedPosts: { type: Boolean, default: true },
    feedRanking: { type: String, enum: ['freshness', 'engagement', 'relevance'], default: 'freshness' },
    followSuggestions: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true }
  },
  
  // Community settings
  communitySettings: {
    showOnlineStatus: { type: Boolean, default: true },
    mentionNotifications: { type: Boolean, default: true },
    groupChatNotifications: { type: Boolean, default: true },
    autoAcceptInvites: { type: Boolean, default: false }
  },
  
  // App settings
  appSettings: {
    theme: { type: String, enum: ['light', 'dark', 'green'], default: 'light' },
    language: { type: String, default: 'en' },
    measurementUnits: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    defaultLanding: { type: String, enum: ['dashboard', 'feed', 'marketplace'], default: 'dashboard' }
  },
  
  // Profile management fields
  skills: [{
    name: { type: String, required: true },
    level: { 
      type: String, 
      enum: ['Beginner', 'Intermediate', 'Professional', 'Expert'], 
      default: 'Beginner' 
    }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, required: true },
    fileUrl: { type: String }
  }],
  services: [{
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: String, required: true }
  }],
  crops: [String],
  livestock: [String],
  farmSize: { type: String },
  yearsExperience: { type: Number, default: 0 },
  experienceLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Professional', 'Expert'], 
    default: 'Beginner' 
  },
  availabilityStatus: { 
    type: String, 
    enum: ['Open to Work', 'Open to Internships', 'Hiring', 'Not Available'], 
    default: 'Not Available' 
  },
  farmImages: [String],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 }
});

module.exports = mongoose.model('User', UserSchema);