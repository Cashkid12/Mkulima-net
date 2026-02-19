const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // In a real implementation, these would come from related collections
    // For now, returning mock data structure that matches the frontend expectations
    const stats = {
      totalPosts: user.postsCount || 0,
      totalLikes: user.likesCount || 0,
      followers: user.followersCount || 0,
      following: user.followingCount || 0
    };

    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/analytics
// @desc    Get user analytics data
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // In a real implementation, this would fetch actual analytics data
    // For now, returning empty data structure for new users
    const analytics = {
      postsOverTime: [],
      likesOverTime: []
    };

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile data
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const profileData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      profilePicture: user.profilePicture,
      farmName: user.farmName,
      location: user.location,
      isProfileComplete: user.isProfileComplete || false
    };

    res.json({ user: profileData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
