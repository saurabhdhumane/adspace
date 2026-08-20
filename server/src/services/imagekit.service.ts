import ImageKit from 'imagekit';
import { env } from '../config/env.js';

let imagekitClient: ImageKit | null = null;

if (env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT) {
  imagekitClient = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  });
}

export interface ImageKitUploadAuthResponse {
  uploadUrl: string;
  key: string;
  finalUrl: string;
  token?: string;
  expire?: number;
  signature?: string;
  publicKey?: string;
  urlEndpoint?: string;
}

export const generateImageKitAuth = async (
  filename: string,
  _fileType: string
): Promise<ImageKitUploadAuthResponse> => {
  const extension = filename.split('.').pop() || 'jpg';
  const key = `banners/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
  const urlEndpoint = env.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, '');
  const finalUrl = `${urlEndpoint}/${key}`;

  if (!imagekitClient || env.IMAGEKIT_PUBLIC_KEY === 'public_mock_key') {
    // Fallback for development mode when mock credentials are used
    return {
      uploadUrl: `http://localhost:${env.PORT}/api/v1/uploads/mock-imagekit-upload?key=${encodeURIComponent(key)}`,
      key,
      finalUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
      token: 'mock_token',
      expire: Math.floor(Date.now() / 1000) + 1800,
      signature: 'mock_signature',
      publicKey: env.IMAGEKIT_PUBLIC_KEY || 'public_mock_key',
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    };
  }

  const authParams = imagekitClient.getAuthenticationParameters();

  return {
    uploadUrl: 'https://upload.imagekit.io/api/v1/files/upload',
    key,
    finalUrl,
    token: authParams.token,
    expire: authParams.expire,
    signature: authParams.signature,
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
  };
};

// Re-export for compatibility with presigned upload endpoint signature
export const generatePresignedUploadUrl = generateImageKitAuth;
