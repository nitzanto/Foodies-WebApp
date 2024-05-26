import mongoose from 'mongoose';
import logger from '../utils/logger';
import dotenv from 'dotenv';
dotenv.config();

const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error}`);
    throw error;
  }
};

export default connectToDatabase;
