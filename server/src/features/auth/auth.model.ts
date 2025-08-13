import mongoose, { Schema } from 'mongoose';
import { UserDocument } from '@/shared/types/database.types';

const UserSchema = new Schema<UserDocument>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    userType: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    avatar: {
      type: String,
      validate: {
        validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
        message: 'Avatar must be a valid URL',
      },
    },
    specialties: [{
      type: String,
      enum: ['scalping', 'swing', 'options', 'futures', 'defi', 'nft', 'macro', 'technical-analysis'],
    }],
    signalsCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgPerformance: {
      type: Number,
      default: 0,
      min: -100,
      max: 10000,
    },
    reputation: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    connectedExchanges: {
      hyperliquid: {
        connected: {
          type: Boolean,
          default: false,
        },
        apiKey: {
          type: String,
          select: false,
        },
        secretKey: {
          type: String,
          select: false,
        },
        walletAddress: String,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        const { _id, __v, ...cleanRet } = ret;
        cleanRet.id = _id;
        
        if (cleanRet.connectedExchanges?.hyperliquid) {
          const { apiKey, secretKey, ...safeExchange } = cleanRet.connectedExchanges.hyperliquid;
          cleanRet.connectedExchanges.hyperliquid = safeExchange;
        }
        
        return cleanRet;
      },
    },
  }
);

UserSchema.index({ walletAddress: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ reputation: -1 });
UserSchema.index({ totalEarnings: -1 });

export const User = mongoose.model<UserDocument>('User', UserSchema);