import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/freelanceos';
  
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct MongoDB connection failed or timed out:`, (error as Error).message);
    console.log(`[MongoDB] Operating in memory / fallback mode. Please start MongoDB service or specify MONGO_URI in server/.env.`);
    return false;
  }
};
