import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertTriangle } from 'lucide-react';
import type { Signal } from '@/types/signals';
import { useTradingStore } from '@/stores/trading-store';
import Button from './button';

interface TradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: Signal;
}

export default function TradingModal({ isOpen, onClose, signal }: TradingModalProps) {
  const [size, setSize] = useState<number>(0.1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [customPrice, setCustomPrice] = useState<number>(signal.entryPrice);
  const { executeTrade, isLoading } = useTradingStore();

  const handleExecute = async () => {
    try {
      const side = signal.side === 'long' ? 'buy' : 'sell';
      const price = orderType === 'limit' ? customPrice : undefined;
      
      await executeTrade(signal.symbol, side, size, price);
      onClose();
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
  };

  const estimatedCost = size * (orderType === 'limit' ? customPrice : signal.entryPrice);
  const riskAmount = signal.stopLoss ? Math.abs((signal.entryPrice - signal.stopLoss) * size) : 0;
  const rewardAmount = signal.takeProfit ? Math.abs((signal.takeProfit - signal.entryPrice) * size) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Execute Signal</h2>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Signal Summary */}
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{signal.symbol}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  signal.side === 'long' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {signal.side.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Entry</p>
                  <p className="font-medium">${signal.entryPrice}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Stop Loss</p>
                  <p className="font-medium">${signal.stopLoss || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Take Profit</p>
                  <p className="font-medium">${signal.takeProfit || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Trade Configuration */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Position Size
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={size}
                  onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Order Type
                </label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                >
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                </select>
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Limit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
              )}
            </div>

            {/* Risk/Reward Summary */}
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-neutral-900 mb-3">Trade Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Estimated Cost:</span>
                  <span className="font-medium">${estimatedCost.toFixed(2)}</span>
                </div>
                {riskAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Max Risk:</span>
                    <span className="font-medium text-red-600">-${riskAmount.toFixed(2)}</span>
                  </div>
                )}
                {rewardAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Max Reward:</span>
                    <span className="font-medium text-green-600">+${rewardAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Confidence:</span>
                  <span className="font-medium">{signal.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm text-yellow-800">
                  Trading involves risk. Only trade with funds you can afford to lose.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleExecute}
                disabled={isLoading || size <= 0}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Executing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Execute Trade
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}