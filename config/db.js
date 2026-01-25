const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
      });
      console.log('✅ MongoDB connected successfully:', conn.connection.host);
      return conn;
    } catch (error) {
      retries++;
      console.error(`Connection attempt ${retries}/${maxRetries} failed:`, error.message);
      
      if (retries < maxRetries) {
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.error('MongoDB connection FAILED after all retries');
        console.error('Please check MONGODB_URI environment variable and ensure MongoDB is accessible');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
