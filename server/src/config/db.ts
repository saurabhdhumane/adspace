import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database] Connection Error:`, error);
    // Gracefully handle local dev mode if MongoDB is not running yet
    console.warn('[Database] Continuing app boot. Ensure MongoDB service is running.');
  }
};
