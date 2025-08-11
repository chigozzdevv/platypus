import mongoose, { Schema, Document } from 'mongoose';

export interface IPAssetDocument extends Document {
  assetId: string;
  creator: string;
  name: string;
  description: string;
  type: 'signal' | 'improvement';
  price: number;
  currency: 'USDC';
  royaltyPercentage: number;
  ipHash: string;
  originAssetId?: string;
  signalId: string;
  improvementIndex?: number;
  metadata: {
    signalData: {
      symbol: string;
      side: 'long' | 'short';
      entryPrice: number;
      stopLoss: number;
      takeProfit: number;
      confidence: number;
      analysis: string;
    };
    creator: string;
    originalSignalId?: string;
  };
  totalSales: number;
  totalRevenue: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IPAssetSchema = new Schema<IPAssetDocument>(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
    },
    creator: {
      type: String,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ['signal', 'improvement'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: ['USDC'],
      default: 'USDC',
    },
    royaltyPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    ipHash: {
      type: String,
      required: true,
      unique: true,
    },
    originAssetId: String,
    signalId: {
      type: String,
      ref: 'Signal',
      required: true,
    },
    improvementIndex: Number,
    metadata: {
      signalData: {
        symbol: { type: String, required: true },
        side: { type: String, enum: ['long', 'short'], required: true },
        entryPrice: { type: Number, required: true },
        stopLoss: { type: Number, required: true },
        takeProfit: { type: Number, required: true },
        confidence: { type: Number, required: true },
        analysis: { type: String, required: true },
      },
      creator: { type: String, required: true },
      originalSignalId: String,
    },
    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        const { _id, __v, ...cleanRet } = ret;
        cleanRet.id = _id;
        return cleanRet;
      },
    },
  }
);

IPAssetSchema.index({ creator: 1 });
IPAssetSchema.index({ assetId: 1 });
IPAssetSchema.index({ signalId: 1 });
IPAssetSchema.index({ type: 1 });
IPAssetSchema.index({ isActive: 1 });
IPAssetSchema.index({ createdAt: -1 });
IPAssetSchema.index({ totalSales: -1 });
IPAssetSchema.index({ totalRevenue: -1 });

export const IPAsset = mongoose.model<IPAssetDocument>('IPAsset', IPAssetSchema);