const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/follow/:id/follow
// @desc    Follow a user
// @access  Private
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if already following
    const currentUser = await User.findById(req.user.id);
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: 'User already followed' });
    }

    // Add user to current user's following array
    currentUser.following.push(req.params.id);
    currentUser.followingCount = currentUser.following.length;

    // Add current user to target user's followers array
    userToFollow.followers.push(req.user.id);
    userToFollow.followersCount = userToFollow.followers.length;

    await currentUser.save();
    await userToFollow.save();

    // Create notification for the user being followed
    if (userToFollow._id.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      
      const notification = await Notification.createNotification({
        recipient: userToFollow._id,
        type: 'follower',
        title: `${currentUser.firstName} ${currentUser.lastName} started following you`,
        description: `${currentUser.firstName} ${currentUser.lastName} is now following you`,
        sourceUser: req.user.id,
        targetObject: { type: 'profile', id: req.user.id },
        actionLink: `/dashboard/profile/${req.user.id}`
      });

      // Emit real-time notification if not filtered out
      if (notification) {
        const io = req.app.get('io');
        if (io) {
          io.to(`user_${userToFollow._id}`).emit('new-notification', {
            type: 'follower',
            title: `${currentUser.firstName} ${currentUser.lastName} started following you`,
            userId: req.user.id,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    res.json({ 
      msg: 'User followed successfully',
      following: currentUser.following,
      followers: userToFollow.followers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/follow/:id/unfollow
// @desc    Unfollow a user
// @access  Private
router.delete('/:id/unfollow', auth, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    if (!userToUnfollow) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const currentUser = await User.findById(req.user.id);
    
    // Check if not following
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ msg: 'User not followed' });
    }

    // Remove user from current user's following array
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.id);
    currentUser.followingCount = currentUser.following.length;

    // Remove current user from target user's followers array
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user.id.toString);
    userToUnfollow.followersCount = userToUnfollow.followers.length;

    await currentUser.save();
    await userToUnfollow.save();

    res.json({ 
      msg: 'User unfollowed successfully',
      following: currentUser.following,
      followers: userToUnfollow.followers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id/followers
// @desc    Get followers of a user
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', ['firstName', 'lastName', 'username', 'profilePicture']);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.followers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:id/following
// @desc    Get users that a user is following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', ['firstName', 'lastName', 'username', 'profilePicture']);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.following);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;