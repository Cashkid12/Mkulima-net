const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI
    // For production (Render), it should be a MongoDB Atlas connection string
    // For development, it can be a local connection
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mkulimanet';
    
    console.log(`Attempting to connect to MongoDB: ${mongoUri}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // For production, use connection options to handle intermittent connection issues
    // For development, you might want to add options for better debugging
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 60000, // Keep trying to send operations for 60 seconds
      socketTimeoutMS: 45000,        // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10,              // Maintain up to 10 socket connections
      family: 4                    // Use IPv4 only
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    
    // Provide guidance based on environment
    if (process.env.NODE_ENV === 'production') {
      console.log('\n--- Production MongoDB Setup ---');
      console.log('For Render deployment, you need a cloud MongoDB service like MongoDB Atlas');
      console.log('1. Create a MongoDB Atlas account: https://www.mongodb.com/atlas/database');
      console.log('2. Create a free cluster');
      console.log('3. Create a database user with username/password');
      console.log('4. Allow connections from anywhere (0.0.0.0/0)');
      console.log('5. Update the MONGODB_URI environment variable in Render with your Atlas connection string');
      console.log('--------------------------------\n');
    } else {
      console.log('\n--- Local MongoDB Setup ---');
      console.log('1. Install MongoDB Community Edition: https://www.mongodb.com/try/download/community');
      console.log('2. Make sure MongoDB service is running on your system');
      console.log('3. Or use MongoDB Atlas for cloud database');
      console.log('---------------------------\n');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;