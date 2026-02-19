const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// @route   POST api/chat/message
// @desc    Send a new message
// @access  Private
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { receiverId, content, messageType, mediaUrl } = req.body;

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ msg: 'Receiver not found' });
    }

    // Create conversation ID (sorted IDs to ensure same ID regardless of who initiated)
    const userIds = [req.userId, receiverId].sort();
    const conversationId = `${userIds[0]}_${userIds[1]}`;

    const newMessage = new Message({
      sender: req.userId,
      receiver: receiverId,
      content,
      messageType: messageType || 'text',
      mediaUrl,
      conversationId
    });

    const message = await newMessage.save();

    // Populate sender and receiver data
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture');

    // In a production app, we would emit to the conversation room
    // This would be handled by the server's Socket.IO connection

    res.json(populatedMessage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/chat/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    // Find all messages where the user is either sender or receiver
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.userId },
            { receiver: req.userId }
          ]
        }
      },
      {
        $group: {
          _id: '$conversationId',
          participants: {
            $addToSet: {
              $cond: [
                { $eq: ['$sender', req.userId] },
                '$receiver',
                '$sender'
              ]
            }
          },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.userId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'participants',
          foreignField: '_id',
          as: 'participantDetails'
        }
      },
      {
        $project: {
          participants: 1,
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1,
          participantDetails: {
            $map: {
              input: '$participantDetails',
              as: 'participant',
              in: {
                _id: '$$participant._id',
                username: '$$participant.username',
                profilePicture: '$$participant.profilePicture'
              }
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/chat/conversation/:userId
// @desc    Get messages in a conversation with a specific user
// @access  Private
router.get('/conversation/:userId', authenticateToken, async (req, res) => {
  try {
    // Verify the other user exists
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create conversation ID
    const userIds = [req.userId, req.params.userId].sort();
    const conversationId = `${userIds[0]}_${userIds[1]}`;

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId,
        receiver: req.userId,
        read: false
      },
      {
        read: true,
        readAt: Date.now()
      }
    );

    // Get messages
    const messages = await Message.find({
      conversationId
    })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/chat/message/:id/read
// @desc    Mark a message as read
// @access  Private
router.put('/message/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    // Ensure the user is the receiver
    if (message.receiver.toString() !== req.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    message.read = true;
    message.readAt = Date.now();
    await message.save();

    res.json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/chat/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.userId,
      read: false
    });

    res.json({ count: unreadCount });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;