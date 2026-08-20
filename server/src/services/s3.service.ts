import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

let s3Client: S3Client | null = null;

if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export const generatePresignedUploadUrl = async (
  filename: string,
  fileType: string
): Promise<{ uploadUrl: string; key: string; finalUrl: string }> => {
  const extension = filename.split('.').pop() || 'jpg';
  const key = `banners/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const finalUrl = `https://${env.S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

  if (!s3Client) {
    // Fallback for development mode without AWS credentials configured
    return {
      uploadUrl: `http://localhost:${env.PORT}/api/v1/uploads/mock-s3-upload?key=${encodeURIComponent(key)}`,
      key,
      finalUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
    };
  }

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: fileType,
  });

  // Presigned URL valid for 5 minutes (300 seconds)
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl, key, finalUrl };
};
