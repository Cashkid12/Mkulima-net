const express = require('express');
const router = express.Router();
const Community = require('../models/Community');
const authenticateToken = require('../middleware/auth');

// @route   GET /api/communities
// @desc    Get all communities
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const communities = await Community.find(query)
      .populate('creator', 'username profilePicture farmName')
      .populate('members.user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Add isJoined and isAdmin flags for the current user
    const communitiesWithUserStatus = communities.map(community => {
      const memberInfo = community.members.find(
        m => m.user._id.toString() === req.userId
      );
      
      return {
        ...community.toObject(),
        isJoined: !!memberInfo,
        isAdmin: memberInfo?.role === 'admin',
        memberCount: community.members.length
      };
    });

    const total = await Community.countDocuments(query);

    res.json({
      communities: communitiesWithUserStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCommunities: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/communities/:id
// @desc    Get community by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'username profilePicture farmName')
      .populate('members.user', 'username profilePicture farmName')
      .populate('messages.sender', 'username profilePicture');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    const memberInfo = community.members.find(
      m => m.user._id.toString() === req.userId
    );

    res.json({
      ...community.toObject(),
      isJoined: !!memberInfo,
      isAdmin: memberInfo?.role === 'admin',
      memberCount: community.members.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities
// @desc    Create a new community
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, category, type, image, location, rules } = req.body;

    const newCommunity = new Community({
      name,
      description,
      category,
      type: type || 'public',
      image,
      location,
      rules: rules || [],
      creator: req.userId,
      members: [{
        user: req.userId,
        role: 'admin'
      }],
      messages: [{
        sender: req.userId,
        content: `Welcome to ${name}! This community has been created.`,
        messageType: 'system'
      }]
    });

    const community = await newCommunity.save();
    
    const populatedCommunity = await Community.findById(community._id)
      .populate('creator', 'username profilePicture farmName')
      .populate('members.user', 'username profilePicture');

    res.json({
      ...populatedCommunity.toObject(),
      isJoined: true,
      isAdmin: true,
      memberCount: 1
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/join
// @desc    Join a community
// @access  Private
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if already a member
    const isMember = community.members.some(
      m => m.user.toString() === req.userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'Already a member of this community' });
    }

    // For private communities, implement request logic here
    if (community.type === 'private') {
      // TODO: Implement join request for private communities
      return res.status(400).json({ message: 'Private communities require invitation' });
    }

    // Add member
    community.members.push({
      user: req.userId,
      role: 'member'
    });

    // Add system message
    community.messages.push({
      sender: req.userId,
      content: 'A new member has joined the community.',
      messageType: 'system'
    });

    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate('creator', 'username profilePicture farmName')
      .populate('members.user', 'username profilePicture');

    res.json({
      ...populatedCommunity.toObject(),
      isJoined: true,
      isAdmin: false,
      memberCount: community.members.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/leave
// @desc    Leave a community
// @access  Private
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Remove member
    community.members = community.members.filter(
      m => m.user.toString() !== req.userId
    );

    await community.save();

    res.json({ message: 'Left community successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/communities/:id/messages
// @desc    Send a message to community
// @access  Private
router.post('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { content, messageType = 'text', mediaUrl } = req.body;

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    const isMember = community.members.some(
      m => m.user.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to send messages' });
    }

    const newMessage = {
      sender: req.userId,
      content,
      messageType,
      mediaUrl
    };

    community.messages.push(newMessage);
    await community.save();

    const populatedCommunity = await Community.findById(community._id)
      .populate('messages.sender', 'username profilePicture farmName');

    const savedMessage = populatedCommunity.messages[populatedCommunity.messages.length - 1];

    res.json(savedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/communities/:id/messages
// @desc    Get community messages
// @access  Private
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is a member
    const isMember = community.members.some(
      m => m.user.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Must be a member to view messages' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get messages in reverse chronological order (newest first)
    const messages = community.messages
      .slice()
      .reverse()
      .slice(skip, skip + parseInt(limit))
      .reverse();

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(community.messages.length / parseInt(limit)),
        totalMessages: community.messages.length,
        hasNext: parseInt(page) < Math.ceil(community.messages.length / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/communities/:id/pin-message
// @desc    Pin a message (admin only)
// @access  Private
router.put('/:id/pin-message', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.body;

    const community = await Community.findById(req.params.id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Check if user is admin
    const memberInfo = community.members.find(
      m => m.user.toString() === req.userId
    );

    if (!memberInfo || memberInfo.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const message = community.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isPinned = true;
    message.pinnedBy = req.userId;
    message.pinnedAt = new Date();

    community.pinnedMessage = message;

    await community.save();

    res.json({ message: 'Message pinned successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
