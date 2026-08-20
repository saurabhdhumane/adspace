import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import inquiryRoutes from './routes/inquiry.routes.js';
import uploadRoutes from './routes/upload.routes.js';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors({ origin: env.CLIENT_ORIGINS, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/banners', bannerRoutes);
  app.use('/api/v1/inquiries', inquiryRoutes);
  app.use('/api/v1/uploads', uploadRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
