const express = require('express');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');
const Job = require('../models/Job');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// @route   GET api/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const conversations = await Conversation.find({
      participants: userId
    })
      .populate([
        {
          path: 'participants',
          select: 'username firstName lastName profilePicture location verified'
        },
        {
          path: 'lastMessage',
          populate: {
            path: 'senderId',
            select: 'username firstName lastName profilePicture'
          }
        },
        {
          path: 'relatedProductId',
          select: 'name images'
        },
        {
          path: 'relatedJobId',
          select: 'title companyName'
        }
      ])
      .sort({ updatedAt: -1 });

    // Add unread count for the current user
    const conversationsWithUnread = conversations.map(conv => {
      const unreadCount = conv.unreadCounts[userId] || 0;
      return {
        ...conv.toObject(),
        unreadCount
      };
    });

    res.json(conversationsWithUnread);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/conversations/:id
// @desc    Get conversation by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate([
        {
          path: 'participants',
          select: 'username firstName lastName profilePicture location verified'
        },
        {
          path: 'relatedProductId',
          select: 'name images'
        },
        {
          path: 'relatedJobId',
          select: 'title companyName'
        }
      ]);

    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // Check if user is part of conversation
    if (!conversation.participants.some(participant => 
      participant._id.toString() === req.userId)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/conversations/:id/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    // Check if user is part of conversation
    if (!conversation.participants.some(participant => 
      participant.toString() === req.userId)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'username firstName lastName profilePicture')
      .sort({ createdAt: 1 });

    // Mark messages as read for the current user
    await Conversation.findByIdAndUpdate(req.params.id, {
      $set: { [`unreadCounts.${req.userId}`]: 0 }
    });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/conversations
// @desc    Create or get existing conversation
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipientId, productId, jobId } = req.body;
    const userId = req.userId;

    if (!recipientId) {
      return res.status(400).json({ msg: 'Recipient ID is required' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient not found' });
    }

    // Check privacy settings - enforce messaging permissions
    if (recipient.privacySettings && recipient.privacySettings.messagePermission === 'no_one') {
      return res.status(403).json({ 
        msg: 'This user does not accept messages.' 
      });
    }
    
    if (recipient.privacySettings && recipient.privacySettings.messagePermission === 'followers') {
      // Check if sender follows recipient
      const sender = await User.findById(userId);
      if (!sender.following.includes(recipientId)) {
        return res.status(403).json({ 
          msg: 'You must follow this user to message them.' 
        });
      }
    }
    
    // Check if this is related to a product and if product messaging is allowed
    if (productId && recipient.privacySettings && !recipient.privacySettings.allowProductMessages) {
      return res.status(403).json({
        msg: 'This user does not accept messages related to products.'
      });
    }
    
    // Check if this is related to a job and if job messaging is allowed
    if (jobId && recipient.privacySettings && !recipient.privacySettings.allowJobMessages) {
      return res.status(403).json({
        msg: 'This user does not accept messages related to jobs.'
      });
    }

    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] },
      relatedProductId: productId || null,
      relatedJobId: jobId || null
    });

    if (conversation) {
      res.json(conversation);
      return;
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [userId, recipientId],
      relatedProductId: productId || null,
      relatedJobId: jobId || null
    });

    await conversation.save();

    // Populate the conversation before returning
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'username firstName lastName profilePicture location verified');

    res.json(populatedConversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/messages
// @desc    Send a message
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { conversationId, content, messageType, mediaUrl, fileName } = req.body;
    const userId = req.userId;

    if (!conversationId || !content) {
      return res.status(400).json({ msg: 'Conversation ID and content are required' });
    }

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    if (!conversation.participants.some(participant => 
      participant.toString() === userId)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Create new message
    const message = new Message({
      conversationId,
      senderId: userId,
      content,
      messageType: messageType || 'text',
      mediaUrl,
      fileName
    });

    await message.save();

    // Update conversation with last message and increment unread counts
    const otherParticipants = conversation.participants.filter(
      participant => participant.toString() !== userId
    );

    const updateUnreadCounts = {};
    otherParticipants.forEach(participant => {
      const currentCount = conversation.unreadCounts[participant] || 0;
      updateUnreadCounts[`unreadCounts.${participant}`] = currentCount + 1;
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      ...updateUnreadCounts
    });

    // Create notifications for other participants in the conversation
    for (const participant of otherParticipants) {
      const Notification = require('../models/Notification');
      const sender = await User.findById(userId).select('firstName lastName');

      const notification = await Notification.createNotification({
        recipient: participant,
        type: 'message',
        title: `${sender.firstName} ${sender.lastName} sent you a message`,
        description: content.length > 100 ? content.substring(0, 100) + '...' : content,
        sourceUser: userId,
        targetObject: { type: 'message', id: message._id },
        actionLink: `/messages/conversation/${conversationId}`
      });

      // Emit real-time notification if not filtered out
      if (notification) {
        const io = req.app.get('io');
        if (io) {
          io.to(`user_${participant}`).emit('new-notification', {
            type: 'message',
            title: `${sender.firstName} ${sender.lastName} sent you a message`,
            conversationId: conversationId,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Populate message before returning
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username firstName lastName profilePicture');

    res.json(populatedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const messageId = req.params.id;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Check if message belongs to a conversation the user is part of
    const conversation = await Conversation.findById(message.conversationId);
    if (!conversation) {
      return res.status(404).json({ msg: 'Conversation not found' });
    }

    if (!conversation.participants.some(participant => 
      participant.toString() === userId)) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update read status
    await Message.findByIdAndUpdate(messageId, {
      $set: { [`readStatus.${userId}`]: true }
    });

    res.json({ msg: 'Message marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/conversations/user/:userId
// @desc    Get conversation between current user and another user
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.userId;

    if (otherUserId === currentUserId) {
      return res.status(400).json({ msg: 'Cannot start conversation with yourself' });
    }

    // Check if other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    });

    if (!conversation) {
      // Check privacy settings - enforce messaging permissions
      if (otherUser.privacySettings && otherUser.privacySettings.messagePermission === 'no_one') {
        return res.status(403).json({ 
          msg: 'This user does not accept messages.' 
        });
      }
      
      if (otherUser.privacySettings && otherUser.privacySettings.messagePermission === 'followers') {
        const currentUser = await User.findById(currentUserId);
        if (!currentUser.following.includes(otherUserId)) {
          return res.status(403).json({ 
            msg: 'You must follow this user to message them.' 
          });
        }
      }

      // Create new conversation
      conversation = new Conversation({
        participants: [currentUserId, otherUserId]
      });
      await conversation.save();
    }

    // Populate the conversation
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate([
        {
          path: 'participants',
          select: 'username firstName lastName profilePicture location verified'
        },
        {
          path: 'lastMessage',
          populate: {
            path: 'senderId',
            select: 'username firstName lastName profilePicture'
          }
        }
      ]);

    const unreadCount = populatedConversation.unreadCounts[currentUserId] || 0;

    res.json({
      ...populatedConversation.toObject(),
      unreadCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;