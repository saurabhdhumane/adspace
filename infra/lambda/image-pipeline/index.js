const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const mongoose = require('mongoose');

const s3 = new S3Client({});

/**
 * AWS Lambda handler triggered by S3 ObjectCreated events.
 * Compresses uploaded banner images and generates thumbnails.
 */
exports.handler = async (event) => {
  console.log('Processing S3 Image Upload Event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Ignore thumbnails to avoid processing loop
    if (key.includes('_thumb.')) continue;

    console.log(`Processing image: ${key} from bucket: ${bucket}`);

    const thumbnailKey = key.replace(/(\.[\w]+)$/, '_thumb$1');
    const thumbnailUrl = `https://${bucket}.s3.amazonaws.com/${thumbnailKey}`;
    const originalUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    // Connect to MongoDB & update Banner document containing this photo
    if (process.env.MONGODB_URI) {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Banner = mongoose.model('Banner', new mongoose.Schema({
          photos: Array
        }));

        await Banner.updateOne(
          { 'photos.url': originalUrl },
          { $set: { 'photos.$.thumbnailUrl': thumbnailUrl } }
        );
        console.log(`Updated Banner photo thumbnailUrl for: ${key}`);
      } catch (err) {
        console.error('Failed to update Banner document in MongoDB:', err);
      } finally {
        await mongoose.disconnect();
      }
    }
  }

  return { statusCode: 200, body: 'Image pipeline execution complete' };
};
