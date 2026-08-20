import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as any,
  });
  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_TTL as any,
  });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, company } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'USER_EXISTS', message: 'User with this email already exists' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      phone,
      passwordHash,
      role,
      company,
      isVerified: false,
    });

    const tokens = generateTokens(user._id.toString(), user.role);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

    await user.save();

    return res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'REGISTER_ERROR', message: error.message },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    const tokens = generateTokens(user._id.toString(), user.role);
    user.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    await user.save();

    return res.json({
      success: true,
      data: {
        user: user.toJSON(),
        tokens,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'LOGIN_ERROR', message: error.message },
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      userId: string;
      role: string;
    };

    const user = await User.findById(decoded.userId).select('+refreshTokenHash');
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token invalid or revoked' },
      });
    }

    const isMatch = await user.compareRefreshToken(refreshToken);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token invalid' },
      });
    }

    const newTokens = generateTokens(user._id.toString(), user.role);
    user.refreshTokenHash = await bcrypt.hash(newTokens.refreshToken, 10);
    await user.save();

    return res.json({
      success: true,
      data: newTokens,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      req.user.refreshTokenHash = undefined;
      await req.user.save();
    }
    return res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'LOGOUT_ERROR', message: error.message },
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  return res.json({
    success: true,
    data: req.user?.toJSON(),
  });
};

export const updatePushToken = async (req: AuthRequest, res: Response) => {
  try {
    const { expoPushToken } = req.body;
    if (req.user) {
      req.user.expoPushToken = expoPushToken;
      await req.user.save();
    }
    return res.json({
      success: true,
      data: req.user?.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'PUSH_TOKEN_ERROR', message: error.message },
    });
  }
};
