import { Request, Response } from 'express';
import { generateImageKitAuth } from '../services/imagekit.service.js';

export const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { filename, fileType } = req.body;
    if (!filename || !fileType) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'filename and fileType are required' },
      });
    }

    const result = await generateImageKitAuth(filename, fileType);
    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'IMAGEKIT_AUTH_ERROR', message: error.message },
    });
  }
};
