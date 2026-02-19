const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// @route   GET /api/settings/account
// @desc    Get account settings
// @access  Private
router.get('/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      profilePicture: user.profilePicture,
      role: user.role,
      farmName: user.farmName,
      verified: user.verified
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/account
// @desc    Update account settings
// @access  Private
router.put('/account', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, bio, location, farmName } = req.body;

    // Check if username is already taken by another user
    const existingUser = await User.findOne({ username, _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const updatedFields = {};
    if (firstName) updatedFields.firstName = firstName;
    if (lastName) updatedFields.lastName = lastName;
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (phone) updatedFields.phone = phone;
    if (bio) updatedFields.bio = bio;
    if (location) updatedFields.location = location;
    if (farmName) updatedFields.farmName = farmName;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      profilePicture: user.profilePicture,
      role: user.role,
      farmName: user.farmName,
      verified: user.verified
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/account/password
// @desc    Update password
// @access  Private
router.put('/account/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Get user with password
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/privacy
// @desc    Get privacy settings
// @access  Private
router.get('/privacy', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('twoFactorAuth showOnlineStatus allowFollowRequests');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      twoFactorAuth: user.twoFactorAuth || false,
      showOnlineStatus: user.showOnlineStatus !== false, // Default to true
      allowFollowRequests: user.allowFollowRequests !== false // Default to true
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/privacy
// @desc    Update privacy settings
// @access  Private
router.put('/privacy', authenticateToken, async (req, res) => {
  try {
    const { twoFactorAuth, showOnlineStatus, allowFollowRequests } = req.body;

    const updatedFields = {};
    if (typeof twoFactorAuth !== 'undefined') updatedFields.twoFactorAuth = twoFactorAuth;
    if (typeof showOnlineStatus !== 'undefined') updatedFields.showOnlineStatus = showOnlineStatus;
    if (typeof allowFollowRequests !== 'undefined') updatedFields.allowFollowRequests = allowFollowRequests;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updatedFields },
      { new: true }
    ).select('twoFactorAuth showOnlineStatus allowFollowRequests');

    res.json({
      twoFactorAuth: user.twoFactorAuth || false,
      showOnlineStatus: user.showOnlineStatus !== false,
      allowFollowRequests: user.allowFollowRequests !== false
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/notifications
// @desc    Get notification settings
// @access  Private
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('notificationSettings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const defaultNotificationSettings = {
      push: {
        followers: true,
        messages: true,
        marketplace: true,
        posts: true,
        communities: true,
        jobs: true
      },
      email: {
        followers: true,
        messages: true,
        marketplace: false,
        posts: true,
        communities: false,
        jobs: true
      },
      inApp: true,
      sound: true
    };

    res.json(user.notificationSettings || defaultNotificationSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/notifications
// @desc    Update notification settings
// @access  Private
router.put('/notifications', authenticateToken, async (req, res) => {
  try {
    const { notificationSettings } = req.body;

    // Validate notification settings structure
    const validNotificationSettings = {
      push: {
        followers: typeof notificationSettings.push?.followers === 'boolean' ? notificationSettings.push.followers : true,
        messages: typeof notificationSettings.push?.messages === 'boolean' ? notificationSettings.push.messages : true,
        marketplace: typeof notificationSettings.push?.marketplace === 'boolean' ? notificationSettings.push.marketplace : true,
        posts: typeof notificationSettings.push?.posts === 'boolean' ? notificationSettings.push.posts : true,
        communities: typeof notificationSettings.push?.communities === 'boolean' ? notificationSettings.push.communities : true,
        jobs: typeof notificationSettings.push?.jobs === 'boolean' ? notificationSettings.push.jobs : true
      },
      email: {
        followers: typeof notificationSettings.email?.followers === 'boolean' ? notificationSettings.email.followers : true,
        messages: typeof notificationSettings.email?.messages === 'boolean' ? notificationSettings.email.messages : true,
        marketplace: typeof notificationSettings.email?.marketplace === 'boolean' ? notificationSettings.email.marketplace : false,
        posts: typeof notificationSettings.email?.posts === 'boolean' ? notificationSettings.email.posts : true,
        communities: typeof notificationSettings.email?.communities === 'boolean' ? notificationSettings.email.communities : false,
        jobs: typeof notificationSettings.email?.jobs === 'boolean' ? notificationSettings.email.jobs : true
      },
      inApp: typeof notificationSettings.inApp === 'boolean' ? notificationSettings.inApp : true,
      sound: typeof notificationSettings.sound === 'boolean' ? notificationSettings.sound : true
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { notificationSettings: validNotificationSettings } },
      { new: true }
    ).select('notificationSettings');

    res.json(user.notificationSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/marketplace
// @desc    Get marketplace settings
// @access  Private
router.get('/marketplace', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('marketplaceSettings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const defaultMarketplaceSettings = {
      defaultVisibility: 'public',
      defaultCategory: 'crops',
      priceUnit: 'KES',
      autoRefresh: true,
      sortPreference: 'freshness'
    };

    res.json(user.marketplaceSettings || defaultMarketplaceSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/marketplace
// @desc    Update marketplace settings
// @access  Private
router.put('/marketplace', authenticateToken, async (req, res) => {
  try {
    const { marketplaceSettings } = req.body;

    const validMarketplaceSettings = {
      defaultVisibility: ['public', 'private'].includes(marketplaceSettings.defaultVisibility) 
        ? marketplaceSettings.defaultVisibility : 'public',
      defaultCategory: marketplaceSettings.defaultCategory || 'crops',
      priceUnit: ['KES', 'USD'].includes(marketplaceSettings.priceUnit) 
        ? marketplaceSettings.priceUnit : 'KES',
      autoRefresh: typeof marketplaceSettings.autoRefresh === 'boolean' ? marketplaceSettings.autoRefresh : true,
      sortPreference: ['freshness', 'relevance', 'price'].includes(marketplaceSettings.sortPreference) 
        ? marketplaceSettings.sortPreference : 'freshness'
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { marketplaceSettings: validMarketplaceSettings } },
      { new: true }
    ).select('marketplaceSettings');

    res.json(user.marketplaceSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/feed
// @desc    Get feed settings
// @access  Private
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('feedSettings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const defaultFeedSettings = {
      showSuggestedPosts: true,
      feedRanking: 'freshness',
      followSuggestions: true,
      showOnlineStatus: true
    };

    res.json(user.feedSettings || defaultFeedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/feed
// @desc    Update feed settings
// @access  Private
router.put('/feed', authenticateToken, async (req, res) => {
  try {
    const { feedSettings } = req.body;

    const validFeedSettings = {
      showSuggestedPosts: typeof feedSettings.showSuggestedPosts === 'boolean' ? feedSettings.showSuggestedPosts : true,
      feedRanking: ['freshness', 'engagement', 'relevance'].includes(feedSettings.feedRanking) 
        ? feedSettings.feedRanking : 'freshness',
      followSuggestions: typeof feedSettings.followSuggestions === 'boolean' ? feedSettings.followSuggestions : true,
      showOnlineStatus: typeof feedSettings.showOnlineStatus === 'boolean' ? feedSettings.showOnlineStatus : true
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { feedSettings: validFeedSettings } },
      { new: true }
    ).select('feedSettings');

    res.json(user.feedSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/communities
// @desc    Get community settings
// @access  Private
router.get('/communities', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('communitySettings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const defaultCommunitySettings = {
      showOnlineStatus: true,
      mentionNotifications: true,
      groupChatNotifications: true,
      autoAcceptInvites: false
    };

    res.json(user.communitySettings || defaultCommunitySettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/communities
// @desc    Update community settings
// @access  Private
router.put('/communities', authenticateToken, async (req, res) => {
  try {
    const { communitySettings } = req.body;

    const validCommunitySettings = {
      showOnlineStatus: typeof communitySettings.showOnlineStatus === 'boolean' ? communitySettings.showOnlineStatus : true,
      mentionNotifications: typeof communitySettings.mentionNotifications === 'boolean' ? communitySettings.mentionNotifications : true,
      groupChatNotifications: typeof communitySettings.groupChatNotifications === 'boolean' ? communitySettings.groupChatNotifications : true,
      autoAcceptInvites: typeof communitySettings.autoAcceptInvites === 'boolean' ? communitySettings.autoAcceptInvites : false
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { communitySettings: validCommunitySettings } },
      { new: true }
    ).select('communitySettings');

    res.json(user.communitySettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/app
// @desc    Get app settings
// @access  Private
router.get('/app', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('appSettings');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const defaultAppSettings = {
      theme: 'light',
      language: 'en',
      measurementUnits: 'metric',
      defaultLanding: 'dashboard'
    };

    res.json(user.appSettings || defaultAppSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/settings/app
// @desc    Update app settings
// @access  Private
router.put('/app', authenticateToken, async (req, res) => {
  try {
    const { appSettings } = req.body;

    const validAppSettings = {
      theme: ['light', 'dark', 'green'].includes(appSettings.theme) ? appSettings.theme : 'light',
      language: appSettings.language || 'en',
      measurementUnits: ['metric', 'imperial'].includes(appSettings.measurementUnits) ? appSettings.measurementUnits : 'metric',
      defaultLanding: ['dashboard', 'feed', 'marketplace'].includes(appSettings.defaultLanding) ? appSettings.defaultLanding : 'dashboard'
    };

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { appSettings: validAppSettings } },
      { new: true }
    ).select('appSettings');

    res.json(user.appSettings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/sessions
// @desc    Get active sessions
// @access  Private
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you'd track sessions in a separate collection
    // For now, we'll return mock data
    res.json([
      {
        id: 'session-1',
        device: 'Chrome on Windows',
        location: 'Nairobi, Kenya',
        ip: '192.168.1.100',
        lastActive: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        current: true
      },
      {
        id: 'session-2',
        device: 'Firefox on Linux',
        location: 'Mombasa, Kenya',
        ip: '10.0.0.50',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        current: false
      }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/settings/sessions/:sessionId
// @desc    Logout from a specific session
// @access  Private
router.delete('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you'd remove the session from the database
    // For now, we'll just return a success message
    res.json({ message: 'Session logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/settings/blocked-users
// @desc    Get blocked users
// @access  Private
router.get('/blocked-users', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you'd fetch blocked users from a separate collection
    // For now, we'll return mock data
    res.json([
      {
        id: 'blocked-1',
        name: 'Jane Doe',
        username: 'janedoe',
        dateBlocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'blocked-2',
        name: 'Bob Smith',
        username: 'bobsmith',
        dateBlocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/settings/blocked-users/:userId
// @desc    Unblock a user
// @access  Private
router.delete('/blocked-users/:userId', authenticateToken, async (req, res) => {
  try {
    // In a real implementation, you'd remove the user from the blocked list
    // For now, we'll just return a success message
    res.json({ message: 'User unblocked successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
