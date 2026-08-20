import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: process.env.PORT || '4000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/adspace',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'supersecretaccesskey123456789',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey987654321',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL || '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL || '30d',
  AWS_REGION: process.env.AWS_REGION || 'ap-south-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
  S3_BUCKET: process.env.S3_BUCKET || 'adspace-media',
  SNS_TOPIC_ARN: process.env.SNS_TOPIC_ARN || '',
  CLIENT_ORIGINS: process.env.CLIENT_ORIGINS ? process.env.CLIENT_ORIGINS.split(',') : ['*'],
};
