const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI, with local fallback
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mkulimanet';
    
    console.log(`Attempting to connect to MongoDB: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri);

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
    
    // If connection to localhost fails, try to provide guidance
    if ((process.env.MONGODB_URI || '').includes('localhost') || !(process.env.MONGODB_URI)) {
      console.log('\n--- MongoDB Setup Help ---');
      console.log('1. Install MongoDB Community Edition from: https://www.mongodb.com/try/download/community');
      console.log('2. Or use MongoDB Atlas (cloud database): https://www.mongodb.com/atlas/database');
      console.log('3. For Atlas, update MONGODB_URI in your .env file with your connection string');
      console.log('4. Make sure MongoDB service is running on your system');
      console.log('--------------------------\n');
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;