const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/chat');
const jobRoutes = require('./routes/jobs');
const notificationRoutes = require('./routes/notifications');
const profileRoutes = require('./routes/profile');
const communityRoutes = require('./routes/communities');
const settingsRoutes = require('./routes/settings');
const weatherRoutes = require('./routes/weather');
const feedRoutes = require('./routes/feed');
const followRoutes = require('./routes/follow');
const messageRoutes = require('./routes/messages');

// Import Clerk middleware
const authenticateClerkUser = require('./middleware/clerkAuth');

// Import models at the top to avoid dynamic imports in socket events
const { Conversation } = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateClerkUser, userRoutes);
app.use('/api/posts', authenticateClerkUser, postRoutes);
app.use('/api/products', authenticateClerkUser, productRoutes);
app.use('/api/chat', authenticateClerkUser, chatRoutes);
app.use('/api/jobs', authenticateClerkUser, jobRoutes);
app.use('/api/messages', authenticateClerkUser, messageRoutes);
app.use('/api/notifications', authenticateClerkUser, notificationRoutes);
app.use('/api/profile', authenticateClerkUser, profileRoutes);
app.use('/api/communities', authenticateClerkUser, communityRoutes);
app.use('/api/settings', authenticateClerkUser, settingsRoutes);
app.use('/api/weather', authenticateClerkUser, weatherRoutes);
app.use('/api/feed', authenticateClerkUser, feedRoutes);
app.use('/api/follow', authenticateClerkUser, followRoutes);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a room (conversation)
  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave a room (conversation)
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation ${conversationId}`);
  });

  // Listen for new messages
  socket.on('send_message', async (data) => {
    try {
      // Emit the message to all users in the conversation room
      io.to(data.conversationId).emit('receive_message', data);
      
      // Update unread counts for other participants
      const conversation = await Conversation.findById(data.conversationId);
      
      if (conversation) {
        const otherParticipants = conversation.participants.filter(
          participant => participant.toString() !== data.senderId
        );
        
        // Increment unread counts for other participants
        const updateUnreadCounts = {};
        otherParticipants.forEach(participant => {
          const currentCount = conversation.unreadCounts[participant] || 0;
          updateUnreadCounts[`unreadCounts.${participant}`] = currentCount + 1;
        });
        
        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: data._id,
          ...updateUnreadCounts
        });
      }
    } catch (err) {
      console.error('Error sending message via socket:', err);
    }
  });

  // Typing indicators
  socket.on('typing_start', (data) => {
    socket.to(data.conversationId).emit('user_typing', {
      userId: data.userId,
      conversationId: data.conversationId
    });
  });

  socket.on('typing_stop', (data) => {
    socket.to(data.conversationId).emit('user_stopped_typing', {
      userId: data.userId,
      conversationId: data.conversationId
    });
  });

  // Mark messages as read
  socket.on('mark_as_read', async (data) => {
    try {
      // Update read status in the message
      await Message.updateMany(
        { conversationId: data.conversationId, 'readStatus.read': { $ne: true } },
        { $set: { [`readStatus.${data.userId}`]: true } }
      );
      
      // Reset unread count for the user
      await Conversation.findByIdAndUpdate(data.conversationId, {
        $set: { [`unreadCounts.${data.userId}`]: 0 }
      });
      
      // Notify other participants that messages were read
      io.to(data.conversationId).emit('messages_read', {
        userId: data.userId,
        conversationId: data.conversationId
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Post-related socket events
  
  // Join a post room for real-time updates
  socket.on('join_post', (postId) => {
    socket.join(`post_${postId}`);
    console.log(`User ${socket.id} joined post room ${postId}`);
  });

  // Leave a post room
  socket.on('leave_post', (postId) => {
    socket.leave(`post_${postId}`);
    console.log(`User ${socket.id} left post room ${postId}`);
  });

  // Join user room for notifications
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${socket.id} joined user room ${userId}`);
  });

  // New post created - broadcast to followers
  socket.on('new_post', async (data) => {
    try {
      const { postId, authorId } = data;
      
      // Get author's followers
      const author = await User.findById(authorId).select('followers');
      
      if (author && author.followers) {
        // Emit to all followers
        author.followers.forEach(followerId => {
          io.to(`user_${followerId}`).emit('new_post_feed', {
            postId,
            authorId,
            timestamp: new Date().toISOString()
          });
        });
      }
      
      // Also emit to the author
      io.to(`user_${authorId}`).emit('new_post_feed', {
        postId,
        authorId,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error broadcasting new post:', err);
    }
  });

  // Post updated
  socket.on('update_post', (data) => {
    const { postId } = data;
    io.to(`post_${postId}`).emit('post_updated', data);
  });

  // Post deleted
  socket.on('delete_post', (data) => {
    const { postId } = data;
    io.to(`post_${postId}`).emit('post_deleted', { postId });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;