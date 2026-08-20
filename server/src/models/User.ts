import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  role: 'owner' | 'advertiser';
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  company?: string;
  avatarUrl?: string;
  isVerified: boolean;
  expoPushToken?: string;
  refreshTokenHash?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  compareRefreshToken(candidateToken: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    role: {
      type: String,
      enum: ['owner', 'advertiser'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    company: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    expoPushToken: {
      type: String,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret.passwordHash;
        delete ret.refreshTokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.compareRefreshToken = async function (candidateToken: string): Promise<boolean> {
  if (!this.refreshTokenHash) return false;
  return bcrypt.compare(candidateToken, this.refreshTokenHash);
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
