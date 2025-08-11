import mongoose, { Schema, Document } from 'mongoose';

export interface AnalyticsSnapshot extends Document {
  type: 'overview' | 'signals' | 'trading' | 'users' | 'ip' | 'detailed';
  timeframe: '24h' | '7d' | '30d' | '90d' | '1y' | 'all';
  data: Record<string, any>;
  computedAt: Date;
  validUntil: Date;
}

const AnalyticsSnapshotSchema = new Schema<AnalyticsSnapshot>(
  {
    type: {
      type: String,
      enum: ['overview', 'signals', 'trading', 'users', 'ip', 'detailed'],
      required: true,
    },
    timeframe: {
      type: String,
      enum: ['24h', '7d', '30d', '90d', '1y', 'all'],
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }
    }
  },
  {
    timestamps: false,
    toJSON: {
      transform: (doc, ret) => {
        const { _id, __v, ...cleanRet } = ret;
        cleanRet.id = _id;
        return cleanRet;
      },
    },
  }
);

AnalyticsSnapshotSchema.index({ type: 1, timeframe: 1 }, { unique: true });
AnalyticsSnapshotSchema.index({ validUntil: 1 });

export const AnalyticsSnapshot = mongoose.model<AnalyticsSnapshot>('AnalyticsSnapshot', AnalyticsSnapshotSchema);