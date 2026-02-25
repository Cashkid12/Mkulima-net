const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
const Post = require('../models/Post');

router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Get actual post statistics
    const totalPosts = await Post.countDocuments({ user: req.user.id });
    const totalReactionsReceived = await Post.aggregate([
      { $match: { user: req.user.id } },
      { $project: { reactionCount: { $size: '$reactions' } } },
      { $group: { _id: null, total: { $sum: '$reactionCount' } } }
    ]);
    
    const totalCommentsReceived = await Post.aggregate([
      { $match: { user: req.user.id } },
      { $project: { commentCount: { $size: '$comments' } } },
      { $group: { _id: null, total: { $sum: '$commentCount' } } }
    ]);

    const stats = {
      totalPosts: totalPosts,
      totalReactionsReceived: totalReactionsReceived[0]?.total || 0,
      totalCommentsReceived: totalCommentsReceived[0]?.total || 0,
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

    // Get post analytics data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get posts over the last 30 days
    const postsOverTime = await Post.aggregate([
      { $match: { 
        user: user._id,
        createdAt: { $gte: thirtyDaysAgo }
      }},
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get reactions received over the last 30 days
    const reactionsOverTime = await Post.aggregate([
      { $match: { 
        user: user._id,
        createdAt: { $gte: thirtyDaysAgo }
      }},
      { $unwind: "$reactions" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get comments received over the last 30 days
    const commentsOverTime = await Post.aggregate([
      { $match: { 
        user: user._id,
        createdAt: { $gte: thirtyDaysAgo }
      }},
      { $unwind: "$comments" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$comments.createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const analytics = {
      postsCount: await Post.countDocuments({ user: user._id }),
      reactionsReceived: await Post.aggregate([
        { $match: { user: user._id } },
        { $project: { reactionCount: { $size: '$reactions' } } },
        { $group: { _id: null, total: { $sum: '$reactionCount' } } }
      ]).then(result => result[0]?.total || 0),
      commentsReceived: await Post.aggregate([
        { $match: { user: user._id } },
        { $project: { commentCount: { $size: '$comments' } } },
        { $group: { _id: null, total: { $sum: '$commentCount' } } }
      ]).then(result => result[0]?.total || 0),
      engagementRate: 0, // Calculate based on reactions/comments/posts
      postsOverTime,
      reactionsOverTime,
      commentsOverTime
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
      isProfileComplete: user.isProfileComplete || false,
      privacySettings: user.privacySettings,
      notificationSettings: user.notificationSettings,
      appearance: user.appearance
    };

    res.json({ user: profileData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID with privacy enforcement
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id;

    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check privacy settings
    if (user.privacySettings.profileVisibility === 'private' && requestingUserId !== userId) {
      // Check if requesting user is following the target user
      const requestingUser = await User.findById(requestingUserId);
      if (!requestingUser.following.includes(userId)) {
        return res.status(403).json({ msg: 'Access denied. This user\'s profile is private.' });
      }
    }

    // Exclude sensitive information
    const userWithoutSensitiveInfo = user.toObject();
    delete userWithoutSensitiveInfo.password;
    delete userWithoutSensitiveInfo.email;
    delete userWithoutSensitiveInfo.phone;
    
    // Add follow status
    const requestingUser = await User.findById(requestingUserId);
    userWithoutSensitiveInfo.isFollowing = requestingUser.following.includes(userId);
    userWithoutSensitiveInfo.isFollowedBy = user.followers.includes(requestingUserId);

    res.json(userWithoutSensitiveInfo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/me
// @desc    Update user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      profileImage,
      coverImage,
      location,
      bio,
      farmInfo,
      professional,
      privacy
    } = req.body;

    // Build user object
    const userFields = {};
    
    if (firstName) userFields.firstName = firstName;
    if (lastName) userFields.lastName = lastName;
    if (email) userFields.email = email;
    if (phone !== undefined) userFields.phone = phone;
    if (profileImage !== undefined) userFields.profilePicture = profileImage;
    if (coverImage !== undefined) userFields.coverImage = coverImage;
    if (location) userFields.location = location;
    if (bio !== undefined) userFields.bio = bio;
    
    // Update farm info fields if provided
    if (farmInfo) {
      if (farmInfo.farmName !== undefined) userFields.farmName = farmInfo.farmName;
      if (farmInfo.farmSize !== undefined) userFields.farmSize = farmInfo.farmSize;
      if (farmInfo.farmingType !== undefined) userFields.farmingType = farmInfo.farmingType;
      if (farmInfo.crops !== undefined) userFields.crops = farmInfo.crops;
      if (farmInfo.livestock !== undefined) userFields.livestock = farmInfo.livestock;
      if (farmInfo.experienceYears !== undefined) userFields.yearsExperience = farmInfo.experienceYears;
      if (farmInfo.certifications !== undefined) {
        // Ensure certifications is properly formatted
        userFields.certifications = Array.isArray(farmInfo.certifications) ? farmInfo.certifications : [];
      }
    }
    
    // Update professional fields if provided
    if (professional) {
      if (professional.skills !== undefined) {
        // Convert array of strings to array of objects if needed
        if (Array.isArray(professional.skills) && professional.skills.length > 0) {
          if (typeof professional.skills[0] === 'string') {
            // If it's an array of strings, convert to array of objects
            userFields.skills = professional.skills.map(skill => ({
              name: skill,
              level: 'Beginner' // Default level
            }));
          } else {
            // If it's already an array of objects, use as is
            userFields.skills = professional.skills;
          }
        } else {
          userFields.skills = [];
        }
      }
      if (professional.lookingFor !== undefined) userFields.lookingFor = professional.lookingFor;
      if (professional.availability !== undefined) userFields.availabilityStatus = professional.availability;
      if (professional.education !== undefined) userFields.education = professional.education;
    }
    
    // Update privacy fields if provided
    if (privacy) {
      if (privacy.profileVisibility !== undefined) userFields.profileVisibility = privacy.profileVisibility;
      if (privacy.showFarmSize !== undefined) userFields.showFarmSize = privacy.showFarmSize;
      if (privacy.showPhone !== undefined) userFields.showPhone = privacy.showPhone;
      if (privacy.messagePermission !== undefined) userFields.messagePermission = privacy.messagePermission;
    }

    // Update isProfileComplete based on whether required fields are filled
    userFields.isProfileComplete = !!(firstName && lastName && email);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;