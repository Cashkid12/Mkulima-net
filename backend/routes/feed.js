const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET api/feed
// @desc    Get feed posts (posts from followed users or all posts)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { feedType = 'forYou', limit = 20, offset = 0 } = req.query;
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let postsQuery = {};
    
    if (feedType === 'following') {
      // Get posts from followed users and the user themselves
      const followingIds = [req.user.id, ...user.following];
      postsQuery = { user: { $in: followingIds } };
    } else {
      // For 'forYou' or default, show all posts
      postsQuery = {};
    }
    
    const posts = await Post.find(postsQuery)
      .populate('user', ['firstName', 'lastName', 'farmName', 'location', 'profilePicture', 'verified'])
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: ['firstName', 'lastName']
        }
      })
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    // Add isFollowing property to each post's user data
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        // Check if the current user is following the post's author
        const isFollowing = user.following.includes(post.user._id);
        
        return {
          ...post.toObject(),
          user: {
            ...post.user.toObject(),
            isFollowing
          }
        };
      })
    );

    res.json(enrichedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/feed/timeline
// @desc    Get timeline posts (all posts ordered by recency)
// @access  Private
router.get('/timeline', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', ['firstName', 'lastName', 'farmName', 'location', 'profilePicture', 'verified'])
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: ['firstName', 'lastName']
        }
      })
      .sort({ createdAt: -1 })
      .limit(20); // Limit to 20 posts

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/feed/:id/react
// @desc    Add reaction to a post
// @access  Private
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { type } = req.body;

    // Validate reaction type
    const validReactions = ['celebrate', 'support', 'love', 'insightful', 'funny'];
    if (!validReactions.includes(type)) {
      return res.status(400).json({ msg: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Find existing reaction from this user
    const existingReactionIndex = post.reactions.findIndex(
      reaction => reaction.user.toString() === req.user.id
    );

    if (existingReactionIndex !== -1) {
      // If user already reacted with this type, remove it (toggle off)
      if (post.reactions[existingReactionIndex].type === type) {
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        // Change reaction type
        post.reactions[existingReactionIndex].type = type;
      }
    } else {
      // Add new reaction
      post.reactions.push({
        user: req.user.id,
        type: type
      });
    }

    await post.save();

    // Populate the post again to return updated data
    const populatedPost = await Post.findById(post._id)
      .populate('user', ['firstName', 'lastName', 'farmName', 'location', 'profilePicture', 'verified'])
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: ['firstName', 'lastName']
        }
      });

    res.json(populatedPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/feed/:id/save
// @desc    Save/unsave a post
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const savedIndex = user.savedPosts.indexOf(req.params.id);
    
    if (savedIndex === -1) {
      // Save post
      user.savedPosts.push(req.params.id);
    } else {
      // Unsave post
      user.savedPosts.splice(savedIndex, 1);
    }

    await user.save();

    res.json({ 
      msg: savedIndex === -1 ? 'Post saved' : 'Post unsaved',
      saved: savedIndex === -1 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;