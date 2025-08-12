import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Position } from '@/types/trading';
import { formatCurrency, formatRelativeTime } from '@/utils/format';

interface PositionCardProps {
  position: Position;
  onClose?: () => void;
  className?: string;
}

export default function PositionCard({ position, onClose, className = '' }: PositionCardProps) {
  const isProfit = position.unrealizedPnl > 0;
  const pnlPercentage = ((position.unrealizedPnl / (position.entryPrice * position.size)) * 100);

  return (
    <motion.div
      className={`bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-lg text-neutral-900">{position.symbol}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            position.side === 'long' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {position.side.toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-neutral-500">
          {formatRelativeTime(position.createdAt)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-neutral-500 block">Size</span>
          <span className="font-medium">{position.size}</span>
        </div>
        <div>
          <span className="text-neutral-500 block">Entry Price</span>
          <span className="font-medium">{formatCurrency(position.entryPrice)}</span>
        </div>
      </div>

      <div className="bg-neutral-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Unrealized P&L</span>
          <div className="flex items-center space-x-1">
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`font-medium ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(position.unrealizedPnl)}
            </span>
            <span className={`text-sm ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              ({pnlPercentage > 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 transition-colors text-sm font-medium"
        >
          Close Position
        </button>
      )}
    </motion.div>
  );
}