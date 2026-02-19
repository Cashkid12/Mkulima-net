const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// @route   POST /api/posts
// @desc    Create a post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('content', 'Content is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        user: req.user.id,
        content: req.body.content,
        media: req.body.media || [],
        productsTagged: req.body.productsTagged || [],
        servicesTagged: req.body.servicesTagged || [],
        communitiesTagged: req.body.communitiesTagged || [],
        location: req.body.location,
        visibility: req.body.visibility || 'public',
        tags: req.body.tags || []
      });

      const post = await newPost.save();
      
      // Populate user data
      await post.populate('user', 'firstName lastName farmName location profilePicture');
      
      // Update user's post count
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { postsCount: 1 }
      });

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET /api/posts/my-posts
// @desc    Get all posts by authenticated user
// @access  Private
router.get('/my-posts', auth, async (req, res) => {
  try {
    const sort = req.query.sort || 'newest';
    
    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'mostLiked':
        sortObj = { 'likes.length': -1, createdAt: -1 };
        break;
      case 'mostCommented':
        sortObj = { 'comments.length': -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const posts = await Post.find({ user: req.user.id })
      .populate('user', 'firstName lastName farmName location profilePicture')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      })
      .sort(sortObj);

    // Add like status for current user
    const postsWithStatus = posts.map(post => {
      const plainPost = post.toObject();
      plainPost.liked = post.likes.includes(req.user.id);
      return plainPost;
    });

    res.json({
      posts: postsWithStatus,
      count: postsWithStatus.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, media, productsTagged, servicesTagged, communitiesTagged, location, visibility, tags } = req.body;
    
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user authorization
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update fields
    if (content) post.content = content;
    if (media) post.media = media;
    if (productsTagged) post.productsTagged = productsTagged;
    if (servicesTagged) post.servicesTagged = servicesTagged;
    if (communitiesTagged) post.communitiesTagged = communitiesTagged;
    if (location) post.location = location;
    if (visibility) post.visibility = visibility;
    if (tags) post.tags = tags;

    await post.save();

    // Populate user data
    await post.populate('user', 'firstName lastName farmName location profilePicture');
    await post.populate({
      path: 'comments.user',
      select: 'firstName lastName'
    });

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check user authorization
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();
    
    // Update user's post count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { postsCount: -1 }
    });

    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/posts/feed
// @desc    Get feed posts with pagination
// @access  Private
router.get('/feed', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts based on visibility settings
    // For now, return posts that are public or from followed users or communities user belongs to
    const user = await User.findById(req.user.id).select('following communities');
    
    // Build query to include public posts and posts from followed users/communities
    const query = {
      $or: [
        { visibility: 'public' },
        { user: { $in: user.following } },
        { communitiesTagged: { $in: user.communities } },
        { user: req.user.id } // Include user's own posts regardless of visibility
      ]
    };

    const posts = await Post.find(query)
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Add like and save status for current user
    const postsWithStatus = await Promise.all(posts.map(async (post) => {
      const plainPost = post.toObject();
      
      // Check if current user has liked this post
      plainPost.liked = post.likes.includes(req.user.id);
      
      // Check if current user has saved this post
      const currentUser = await User.findById(req.user.id);
      plainPost.saved = currentUser?.savedPosts?.includes(post._id) || false;
      
      return plainPost;
    }));

    const totalPosts = await Post.countDocuments(query);
    const hasMore = skip + posts.length < totalPosts;

    res.json({
      posts: postsWithStatus,
      hasMore,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if post has already been liked by user
    if (post.likes.includes(req.user.id)) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.toString() !== req.user.id);
      await post.save();
      return res.json({ msg: 'Post unliked', likes: post.likes.length });
    } else {
      // Like the post
      post.likes.unshift(req.user.id);
      await post.save();
      return res.json({ msg: 'Post liked', likes: post.likes.length });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/:id/save
// @desc    Save/unsave a post
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.id;

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if post is already saved
    if (user.savedPosts.includes(postId)) {
      // Unsave the post
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
      await user.save();
      return res.json({ msg: 'Post unsaved' });
    } else {
      // Save the post
      user.savedPosts.unshift(postId);
      await user.save();
      return res.json({ msg: 'Post saved' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/upload-media
// @desc    Upload media for posts
// @access  Private
const postUpload = require('../utils/postUpload');

router.post('/upload-media', auth, postUpload.array('media', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ msg: 'No files uploaded' });
    }

    // Return the file paths for the uploaded media
    const filePaths = req.files.map(file => file.path);

    res.json({
      msg: 'Media uploaded successfully',
      mediaPaths: filePaths
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;