const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   GET /api/settings
// @desc    Get current user settings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({
      account: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bio: user.bio,
        location: user.location,
        farmName: user.farmName,
        profilePicture: user.profilePicture
      },
      privacy: user.privacySettings,
      notifications: user.notificationSettings,
      appearance: user.appearance
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/settings/account
// @desc    Update account settings
// @access  Private
router.patch('/account', [
  auth,
  [
    body('firstName').optional().trim().isLength({ min: 2, max: 30 }),
    body('lastName').optional().trim().isLength({ min: 2, max: 30 }),
    body('email').optional().isEmail(),
    body('bio').optional().trim().isLength({ max: 500 }),
    body('location').optional().trim().isLength({ max: 100 }),
    body('farmName').optional().trim().isLength({ max: 100 }),
    body('profilePicture').optional().isURL()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, bio, location, farmName, profilePicture } = req.body;

    // Build settings object
    const settingsFields = {};
    if (firstName) settingsFields.firstName = firstName;
    if (lastName) settingsFields.lastName = lastName;
    if (email) settingsFields.email = email;
    if (bio) settingsFields.bio = bio;
    if (location) {
      if (!settingsFields.location) settingsFields.location = {};
      settingsFields.location.county = location.county || settingsFields.location.county || '';
      settingsFields.location.subCounty = location.subCounty || settingsFields.location.subCounty || '';
    }
    if (farmName) settingsFields.farmName = farmName;
    if (profilePicture) settingsFields.profilePicture = profilePicture;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: settingsFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Emit socket event for real-time update
    req.app.get('io').to(req.user.id).emit('userUpdated', user);

    res.json({
      msg: 'Account settings updated successfully',
      user: {
        account: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          bio: user.bio,
          location: user.location,
          farmName: user.farmName,
          profilePicture: user.profilePicture
        }
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/settings/privacy
// @desc    Update privacy settings
// @access  Private
router.patch('/privacy', [
  auth,
  [
    body('profileVisibility').optional().isIn(['public', 'followers', 'private']),
    body('defaultPostVisibility').optional().isIn(['public', 'followers']),
    body('messagePermission').optional().isIn(['everyone', 'followers', 'no_one']),
    body('allowProductMessages').optional().isBoolean(),
    body('allowJobMessages').optional().isBoolean()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { profileVisibility, defaultPostVisibility, messagePermission, allowProductMessages, allowJobMessages } = req.body;

    // Build privacy settings object
    const privacySettings = {};
    if (profileVisibility !== undefined) privacySettings.profileVisibility = profileVisibility;
    if (defaultPostVisibility !== undefined) privacySettings.defaultPostVisibility = defaultPostVisibility;
    if (messagePermission !== undefined) privacySettings.messagePermission = messagePermission;
    if (allowProductMessages !== undefined) privacySettings.allowProductMessages = allowProductMessages;
    if (allowJobMessages !== undefined) privacySettings.allowJobMessages = allowJobMessages;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { privacySettings } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Emit socket event for real-time update
    req.app.get('io').to(req.user.id).emit('userUpdated', user);

    res.json({
      msg: 'Privacy settings updated successfully',
      user: {
        privacy: user.privacySettings
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/settings/notifications
// @desc    Update notification settings
// @access  Private
router.patch('/notifications', [
  auth,
  [
    body('reactions').optional().isBoolean(),
    body('comments').optional().isBoolean(),
    body('followers').optional().isBoolean(),
    body('messages').optional().isBoolean(),
    body('marketplace').optional().isBoolean(),
    body('jobs').optional().isBoolean()
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reactions, comments, followers, messages, marketplace, jobs } = req.body;

    // Build notification settings object
    const notificationSettings = {};
    if (reactions !== undefined) notificationSettings.reactions = reactions;
    if (comments !== undefined) notificationSettings.comments = comments;
    if (followers !== undefined) notificationSettings.followers = followers;
    if (messages !== undefined) notificationSettings.messages = messages;
    if (marketplace !== undefined) notificationSettings.marketplace = marketplace;
    if (jobs !== undefined) notificationSettings.jobs = jobs;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { notificationSettings } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Emit socket event for real-time update
    req.app.get('io').to(req.user.id).emit('userUpdated', user);

    res.json({
      msg: 'Notification settings updated successfully',
      user: {
        notifications: user.notificationSettings
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/settings/password
// @desc    Change password
// @access  Private
router.patch('/password', [
  auth,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/settings/account
// @desc    Delete account
// @access  Private
router.delete('/account', [auth], async (req, res) => {
  try {
    const userId = req.user.id;

    // Use transaction to ensure data consistency
    const session = await User.startSession();
    await session.withTransaction(async () => {
      // Delete user's posts
      await Post.deleteMany({ user: userId }, { session });

      // Delete user's messages
      await Message.deleteMany({ 
        $or: [{ sender: userId }, { recipient: userId }] 
      }, { session });

      // Delete user's notifications
      await Notification.deleteMany({ 
        $or: [{ user: userId }, { sender: userId }] 
      }, { session });

      // Remove user from other users' followers/following lists
      await User.updateMany(
        { followers: userId },
        { $pull: { followers: userId } },
        { session }
      );
      await User.updateMany(
        { following: userId },
        { $pull: { following: userId } },
        { session }
      );

      // Delete the user
      await User.findByIdAndDelete(userId, { session });
    });
    await session.endSession();

    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH /api/settings/appearance
// @desc    Update appearance settings
// @access  Private
router.patch('/appearance', [
  auth,
  [
    body('theme').optional().isIn(['light', 'dark', 'system'])
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { theme } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { appearance: theme } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Emit socket event for real-time update
    req.app.get('io').to(req.user.id).emit('userUpdated', user);

    res.json({
      msg: 'Appearance settings updated successfully',
      user: {
        appearance: user.appearance
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;