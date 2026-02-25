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
        postType: req.body.postType || 'text',
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

      // Trigger notification for followers
      try {
        const author = await User.findById(req.user.id).select('firstName lastName profilePicture');
        const followers = await User.find({ _id: { $in: author.followers } });
        
        // Import Notification model here to avoid circular dependencies
        const Notification = require('../models/Notification');
        
        for (const follower of followers) {
          const notification = await Notification.createNotification({
            recipient: follower._id,
            type: 'post',
            title: `${author.firstName} ${author.lastName} posted`,
            description: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            sourceUser: req.user.id,
            targetObject: { type: 'post', id: post._id },
            actionLink: `/posts/${post._id}`
          });
          
          // Only emit real-time notification if it wasn't filtered out
          if (notification) {
            // Emit real-time notification via Socket.IO if available
            const io = req.app.get('io');
            if (io) {
              io.to(`user_${follower._id}`).emit('new-notification', {
                type: 'post',
                title: `${author.firstName} ${author.lastName} posted`,
                description: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
                postId: post._id,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      } catch (notificationErr) {
        console.error('Error sending notifications:', notificationErr);
        // Continue with the response even if notifications fail
      }

      // Add like and save status for current user
      const plainPost = post.toObject();
      plainPost.liked = post.likes.includes(req.user.id);
      plainPost.saved = user.savedPosts.includes(post._id);
      plainPost.commentsCount = post.comments.length;
      plainPost.reactions = [];
      plainPost.sharesCount = 0;
      plainPost.isFollowingAuthor = true; // User is always following themselves

      res.json(plainPost);
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

// @route   GET /api/users/:userId/posts
// @desc    Get posts by a specific user (for profile page)
// @access  Private
router.get('/users/:userId/posts', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
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

    const posts = await Post.find({ user: userId })
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      })
      .sort(sortObj);

    // Check if current user is following the profile owner
    const currentUser = await User.findById(req.user.id);
    const isFollowingAuthor = currentUser.following.includes(userId);

    // Add status for current user
    const postsWithStatus = posts.map(post => {
      const plainPost = post.toObject();
      plainPost.liked = post.likes.includes(req.user.id);
      plainPost.saved = currentUser.savedPosts.includes(post._id);
      plainPost.commentsCount = post.comments.length;
      plainPost.reactions = [];
      plainPost.sharesCount = 0;
      plainPost.isFollowingAuthor = isFollowingAuthor;
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

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      });

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if current user is following the post's author
    const user = await User.findById(req.user.id);
    const isFollowing = user.following.includes(post.user._id);

    // Add like and save status for current user
    const plainPost = post.toObject();
    plainPost.liked = post.likes.includes(req.user.id);
    
    // Check if current user has saved this post
    plainPost.saved = user.savedPosts.includes(post._id);
    
    // Add isFollowing property to the user object
    plainPost.user.isFollowing = isFollowing;

    res.json(plainPost);
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

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      });

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check privacy settings for post visibility
    const currentUser = await User.findById(req.user.id);
    const postOwner = await User.findById(post.user._id);
    
    // If post is not public and user is not the owner
    if (post.visibility !== 'public' && post.user.toString() !== req.user.id) {
      // If post is followers-only, check if current user follows the post owner
      if (post.visibility === 'followers' && !currentUser.following.includes(post.user._id)) {
        return res.status(403).json({ msg: 'You must follow this user to see their posts' });
      }
    }

    // Check if current user is following the post's author
    const isFollowing = currentUser.following.includes(post.user._id);

    // Add like and save status for current user
    const plainPost = post.toObject();
    plainPost.liked = post.likes.includes(req.user.id);
    
    // Check if current user has saved this post
    plainPost.saved = currentUser.savedPosts.includes(post._id);
    
    // Add isFollowing property to the user object
    plainPost.user.isFollowing = isFollowing;

    res.json(plainPost);
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

    // Additional filtering for privacy: exclude posts from users who have restricted visibility
    const userFollowingIds = user.following;
    const allUsers = await User.find({
      _id: { $in: userFollowingIds }
    }).select('_id privacySettings');

    // Get IDs of users whose posts should be visible
    const visibleUserIds = [];
    allUsers.forEach(usr => {
      if (usr.privacySettings.defaultPostVisibility === 'public' ||
          usr.privacySettings.defaultPostVisibility === 'followers') {
        visibleUserIds.push(usr._id);
      }
    });

    // Update query to include only posts from users with appropriate privacy settings
    query.$or = [
      { visibility: 'public' },
      { user: { $in: [...userFollowingIds, ...visibleUserIds, req.user.id] } },
      { communitiesTagged: { $in: user.communities } },
      { user: req.user.id }
    ];

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

// @route   POST /api/posts/:id/react
// @desc    React to a post (LinkedIn-style reactions)
// @access  Private
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { type } = req.body;
    const validReactions = ['celebrate', 'support', 'love', 'insightful', 'funny'];
    
    if (!type || !validReactions.includes(type)) {
      return res.status(400).json({ msg: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user already reacted
    const existingReactionIndex = post.reactions.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (existingReactionIndex >= 0) {
      // Update existing reaction
      post.reactions[existingReactionIndex].type = type;
    } else {
      // Add new reaction
      post.reactions.push({
        user: req.user.id,
        type: type,
        createdAt: new Date()
      });
    }

    await post.save();

    // Populate user data for the reaction
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'reactions.user',
        select: 'firstName lastName profilePicture'
      });

    // Get user's reaction
    const userReaction = populatedPost.reactions.find(
      r => r.user._id.toString() === req.user.id
    );

    // Calculate reaction counts
    const reactionCounts = {};
    validReactions.forEach(r => {
      reactionCounts[r] = populatedPost.reactions.filter(
        reaction => reaction.type === r
      ).length;
    });

    // Emit real-time reaction update
    const io = req.app.get('io');
    if (io) {
      io.to(`post_${post._id}`).emit('post_reaction', {
        postId: post._id,
        reactionCounts,
        userReaction: userReaction ? { type: userReaction.type, user: req.user.id } : null
      });
    }

    // Create notification for post author (if not self)
    if (post.user.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      const user = await User.findById(req.user.id).select('firstName lastName');
      
      const notification = await Notification.createNotification({
        recipient: post.user,
        type: 'reaction',
        title: `${user.firstName} ${user.lastName} reacted to your post`,
        description: `Reacted with ${type}`,
        sourceUser: req.user.id,
        targetObject: { type: 'post', id: post._id },
        actionLink: `/posts/${post._id}`
      });

      // Only emit real-time notification if it wasn't filtered out
      if (notification && io) {
        io.to(`user_${post.user}`).emit('new-notification', {
          type: 'reaction',
          title: `${user.firstName} ${user.lastName} reacted to your post`,
          postId: post._id,
          timestamp: new Date().toISOString()
        });
      }
    }

    res.json({
      msg: 'Reaction added',
      reactionCounts,
      userReaction: userReaction ? userReaction.type : null,
      totalReactions: populatedPost.reactions.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/posts/:id/react
// @desc    Remove reaction from a post
// @access  Private
router.delete('/:id/react', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Remove user's reaction
    post.reactions = post.reactions.filter(
      r => r.user.toString() !== req.user.id
    );

    await post.save();

    // Calculate reaction counts
    const validReactions = ['celebrate', 'support', 'love', 'insightful', 'funny'];
    const reactionCounts = {};
    validReactions.forEach(r => {
      reactionCounts[r] = post.reactions.filter(
        reaction => reaction.type === r
      ).length;
    });

    // Emit real-time reaction update
    const io = req.app.get('io');
    if (io) {
      io.to(`post_${post._id}`).emit('post_reaction_removed', {
        postId: post._id,
        reactionCounts,
        userId: req.user.id
      });
    }

    res.json({
      msg: 'Reaction removed',
      reactionCounts,
      totalReactions: post.reactions.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/posts/:id/reactions
// @desc    Get reactions for a post
// @access  Private
router.get('/:id/reactions', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate({
        path: 'reactions.user',
        select: 'firstName lastName profilePicture'
      });

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Calculate reaction counts
    const validReactions = ['celebrate', 'support', 'love', 'insightful', 'funny'];
    const reactionCounts = {};
    validReactions.forEach(r => {
      reactionCounts[r] = post.reactions.filter(
        reaction => reaction.type === r
      ).length;
    });

    // Get user's reaction
    const userReaction = post.reactions.find(
      r => r.user._id.toString() === req.user.id
    );

    res.json({
      reactions: post.reactions,
      reactionCounts,
      userReaction: userReaction ? userReaction.type : null,
      totalReactions: post.reactions.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/unlike a post (legacy - redirects to react)
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

// @route   POST /api/posts/:id/comment
// @desc    Comment on a post
// @access  Private
router.post('/:id/comment', [
  auth,
  [
    check('content', 'Comment content is required')
      .not()
      .isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const newComment = {
      user: req.user.id,
      content: req.body.content,
      name: user.firstName + ' ' + user.lastName,
      createdAt: new Date()
    };

    post.comments.unshift(newComment);
    await post.save();

    // Populate the user data for the comment
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName profilePicture'
      });

    // Get the newly added comment with populated user
    const addedComment = populatedPost.comments[0];

    // Emit real-time comment update
    const io = req.app.get('io');
    if (io) {
      io.to(`post_${post._id}`).emit('new_comment', {
        postId: post._id,
        comment: addedComment,
        commentsCount: populatedPost.comments.length
      });
    }

    // Create notification for post author (if not self)
    if (post.user.toString() !== req.user.id) {
      const Notification = require('../models/Notification');
      
      const notification = await Notification.createNotification({
        recipient: post.user,
        type: 'comment',
        title: `${user.firstName} ${user.lastName} commented on your post`,
        description: req.body.content.substring(0, 100) + (req.body.content.length > 100 ? '...' : ''),
        sourceUser: req.user.id,
        targetObject: { type: 'post', id: post._id },
        actionLink: `/posts/${post._id}`
      });

      // Only emit real-time notification if it wasn't filtered out
      if (notification && io) {
        io.to(`user_${post.user}`).emit('new-notification', {
          type: 'comment',
          title: `${user.firstName} ${user.lastName} commented on your post`,
          postId: post._id,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Add like and save status for current user
    const plainPost = populatedPost.toObject();
    plainPost.liked = populatedPost.likes.includes(req.user.id);
    
    // Check if current user has saved this post
    const currentUser = await User.findById(req.user.id);
    plainPost.saved = currentUser.savedPosts.includes(populatedPost._id);
    
    // Check if current user is following the post's author
    const isFollowing = currentUser.following.includes(plainPost.user._id);
    plainPost.user.isFollowing = isFollowing;

    res.json(plainPost);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/posts/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Find the comment
    const comment = post.comments.find(
      c => c._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user is authorized (comment owner or post owner)
    if (
      comment.user.toString() !== req.user.id &&
      post.user.toString() !== req.user.id
    ) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Remove the comment
    post.comments = post.comments.filter(
      c => c._id.toString() !== req.params.commentId
    );
    await post.save();

    // Emit real-time comment deletion
    const io = req.app.get('io');
    if (io) {
      io.to(`post_${post._id}`).emit('comment_deleted', {
        postId: post._id,
        commentId: req.params.commentId,
        commentsCount: post.comments.length
      });
    }

    res.json({ msg: 'Comment removed', commentsCount: post.comments.length });
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

// @route   GET /api/posts/dashboard/stats
// @desc    Get post engagement stats for dashboard
// @access  Private
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's posts
    const posts = await Post.find({ user: userId });

    // Calculate stats
    const totalPosts = posts.length;
    const totalReactions = posts.reduce((sum, post) => sum + post.reactions.length, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comments.length, 0);
    const totalShares = posts.reduce((sum, post) => sum + (post.sharesCount || 0), 0);

    // Calculate engagement rate (reactions + comments + shares / total posts)
    const totalEngagements = totalReactions + totalComments + totalShares;
    const engagementRate = totalPosts > 0 ? (totalEngagements / totalPosts).toFixed(2) : 0;

    // Get reaction breakdown
    const reactionBreakdown = {
      celebrate: 0,
      support: 0,
      love: 0,
      insightful: 0,
      funny: 0
    };

    posts.forEach(post => {
      post.reactions.forEach(reaction => {
        if (reactionBreakdown.hasOwnProperty(reaction.type)) {
          reactionBreakdown[reaction.type]++;
        }
      });
    });

    // Get posts from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentPosts = posts.filter(post => new Date(post.createdAt) >= thirtyDaysAgo);
    const postsThisMonth = recentPosts.length;

    res.json({
      totalPosts,
      totalReactions,
      totalComments,
      totalShares,
      totalEngagements,
      engagementRate,
      reactionBreakdown,
      postsThisMonth,
      averageReactionsPerPost: totalPosts > 0 ? (totalReactions / totalPosts).toFixed(2) : 0,
      averageCommentsPerPost: totalPosts > 0 ? (totalComments / totalPosts).toFixed(2) : 0
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/posts/search
// @desc    Search posts by keywords, user, crop type, or location
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search query
    const searchQuery = {
      $or: [
        { content: { $regex: q, $options: 'i' } }, // Search in content
        { tags: { $regex: q, $options: 'i' } }, // Search in tags
        { location: { $regex: q, $options: 'i' } }, // Search by location
        { crops: { $regex: q, $options: 'i' } }, // Search by crops in post
        { livestock: { $regex: q, $options: 'i' } } // Search by livestock in post
      ]
    };
    
    // First, find matching posts
    const posts = await Post.find(searchQuery)
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // If search term matches user names, find those posts too
    const matchedUsers = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    }).select('_id');
    
    if (matchedUsers.length > 0) {
      const userIds = matchedUsers.map(user => user._id);
      const userPosts = await Post.find({
        user: { $in: userIds },
        _id: { $nin: posts.map(p => p._id) } // Avoid duplicates
      })
      .populate('user', 'firstName lastName farmName location profilePicture verified')
      .populate({
        path: 'comments.user',
        select: 'firstName lastName'
      })
      .sort({ createdAt: -1 });
      
      // Combine posts
      posts.push(...userPosts);
    }

    // Count total results for pagination - need to include both post and user matches
    const postMatchesCount = await Post.countDocuments(searchQuery);
    
    // Count user-based matches separately
    const matchedUsersCount = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ]
    }).select('_id');
    
    let userBasedMatchesCount = 0;
    if (matchedUsersCount.length > 0) {
      const userIds = matchedUsersCount.map(user => user._id);
      const excludedIds = posts.map(p => p._id);
      userBasedMatchesCount = await Post.countDocuments({
        user: { $in: userIds },
        _id: { $nin: excludedIds } // Avoid double counting
      });
    }
    
    const totalResults = postMatchesCount + userBasedMatchesCount;
    
    // Add status for current user
    const postsWithStatus = posts.map(post => {
      const plainPost = post.toObject();
      plainPost.liked = post.likes.includes(req.user.id);
      plainPost.saved = req.user.savedPosts.includes(post._id);
      plainPost.commentsCount = post.comments.length;
      plainPost.reactions = [];
      plainPost.sharesCount = 0;
      plainPost.isFollowingAuthor = false; // Will be determined separately
      return plainPost;
    });
    
    // Check following status for each post
    for (let i = 0; i < postsWithStatus.length; i++) {
      const post = postsWithStatus[i];
      const user = await User.findById(req.user.id);
      post.isFollowingAuthor = user.following.includes(post.user._id);
    }
    
    res.json({
      posts: postsWithStatus,
      totalResults,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalResults / parseInt(limit)),
      hasNextPage: skip + posts.length < totalResults
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;