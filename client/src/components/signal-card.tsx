import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Signal } from '@/types/signals';
import TradingModal from './trading-modal';
import Button from './button';

interface SignalCardProps {
  signal: Signal;
  showPrice?: boolean;
  showExecute?: boolean;
  onView?: () => void;
  onBuy?: () => void;
  onImprove?: () => void;
  className?: string;
}

export default function SignalCard({
  signal,
  showPrice = false,
  showExecute = false,
  onView,
  onBuy,
  onImprove,
  className = ''
}: SignalCardProps) {
  const [showTradingModal, setShowTradingModal] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const formatTimeframe = (date: string) => {
    const now = new Date();
    const signalDate = new Date(date);
    const diffHours = Math.floor((now.getTime() - signalDate.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Now';
    if (diffHours < 24) return `${diffHours}h`;
    return `${Math.floor(diffHours / 24)}d`;
  };

  const getRRRatio = () => {
    if (!signal.stopLoss || !signal.takeProfit) return 0;
    const risk = Math.abs(signal.entryPrice - signal.stopLoss);
    const reward = Math.abs(signal.takeProfit - signal.entryPrice);
    return reward / risk;
  };

  return (
    <motion.div
      className={`bg-white border border-neutral-200 rounded-lg p-3 hover:shadow-md transition-shadow ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center space-x-2 min-w-0">
          <h3 className="font-semibold text-base text-neutral-900 truncate">{signal.symbol}</h3>
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
              signal.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {signal.side.toUpperCase()}
          </span>
        </div>
        <span className="text-xs text-neutral-500">{formatTimeframe(signal.createdAt)}</span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-[12px]">
        <div>
          <span className="text-neutral-500 block">R/R</span>
          <span className="font-medium">{getRRRatio().toFixed(1)}</span>
        </div>
        <div>
          <span className="text-neutral-500 block">Conf</span>
          <span className="font-medium">{signal.confidence}%</span>
        </div>
        {showPrice && (
          <div>
            <span className="text-neutral-500 block">Price</span>
            <span className="font-medium">{formatPrice(signal.entryPrice)}</span>
          </div>
        )}
      </div>

      {signal.registeredAsIP && (
        <div className="mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            Creator-owned IP
          </span>
        </div>
      )}

      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{signal.analysis.technicalAnalysis}</p>

      <div className="flex space-x-2">
        {onView && (
          <Button onClick={onView} variant="secondary" className="flex-1 text-sm h-auto py-2">
            View
          </Button>
        )}
        {onBuy && (
          <Button onClick={onBuy} className="flex-1 text-sm h-auto py-2">
            Buy
          </Button>
        )}
        {onImprove && (
          <Button onClick={onImprove} variant="secondary" className="flex-1 text-sm h-auto py-2">
            Improve
          </Button>
        )}
        {showExecute && (
          <Button onClick={() => setShowTradingModal(true)} className="flex-1 text-sm h-auto py-2">
            Execute
          </Button>
        )}
      </div>

      <TradingModal isOpen={showTradingModal} onClose={() => setShowTradingModal(false)} signal={signal} />
    </motion.div>
  );
}