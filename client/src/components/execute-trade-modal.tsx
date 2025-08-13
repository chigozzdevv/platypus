import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator, TrendingUp, AlertTriangle } from 'lucide-react';
import { tradingService } from '@/services/trading';
import type { Signal } from '@/types/signals';

interface ExecuteTradeModalProps {
  signal: Signal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExecuteTradeModal({ signal, isOpen, onClose, onSuccess }: ExecuteTradeModalProps) {
  const [riskPercentage, setRiskPercentage] = useState(2);
  const [maxLeverage, setMaxLeverage] = useState(5);
  const [positionSize, setPositionSize] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (isOpen && signal) {
      calculatePosition();
    }
  }, [isOpen, signal, riskPercentage, maxLeverage]);

  const calculatePosition = async () => {
    setCalculating(true);
    try {
      const calculation = await tradingService.calculatePositionSize({
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss!,
        leverage: Math.min(signal.leverage!, maxLeverage),
        symbol: signal.symbol,
        winRate: signal.confidence
      });
      setPositionSize(calculation);
    } catch (error) {
      console.error('Failed to calculate position:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleExecute = async () => {
    if (!positionSize) return;

    setExecuting(true);
    try {
      await tradingService.executeTrade({
        symbol: signal.symbol,
        side: signal.side === 'long' ? 'buy' : 'sell',
        size: positionSize.positionSize,
        orderType: 'limit',
        price: signal.entryPrice
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Trade execution failed:', error);
    } finally {
      setExecuting(false);
    }
  };

  const riskReward = signal.takeProfit && signal.stopLoss && signal.entryPrice 
    ? Math.abs(signal.takeProfit - signal.entryPrice) / Math.abs(signal.entryPrice - signal.stopLoss)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Execute Trade</h2>
                <p className="text-sm text-neutral-600">{signal.symbol} - {signal.side.toUpperCase()}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Signal Details */}
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-neutral-900 mb-3">Signal Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-500">Entry Price</p>
                      <p className="font-medium">${signal.entryPrice}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Stop Loss</p>
                      <p className="font-medium">${signal.stopLoss}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Take Profit</p>
                      <p className="font-medium">${signal.takeProfit}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500">Confidence</p>
                      <p className="font-medium">{signal.confidence}%</p>
                    </div>
                  </div>
                </div>

                {/* Risk Management */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-neutral-900">Risk Management</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Risk Per Trade: {riskPercentage}%
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="5"
                      step="0.5"
                      value={riskPercentage}
                      onChange={(e) => setRiskPercentage(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Max Leverage: {maxLeverage}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={maxLeverage}
                      onChange={(e) => setMaxLeverage(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Position Calculation */}
                {calculating ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                      <span className="text-blue-800">Calculating position size...</span>
                    </div>
                  </div>
                ) : positionSize ? (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Calculator className="w-5 h-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-green-900">Position Calculation</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-green-600">Position Size</p>
                        <p className="font-medium text-green-900">${positionSize.positionSize.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-green-600">Risk Amount</p>
                        <p className="font-medium text-green-900">${positionSize.riskAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-green-600">Leverage Used</p>
                        <p className="font-medium text-green-900">{positionSize.leverage}x</p>
                      </div>
                      <div>
                        <p className="text-green-600">Risk:Reward</p>
                        <p className="font-medium text-green-900">1:{riskReward.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Trading involves risk. Only risk what you can afford to lose.
                    </p>
                  </div>
                </div>

                {/* Execute Button */}
                <button
                  onClick={handleExecute}
                  disabled={executing || calculating || !positionSize}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium flex items-center justify-center disabled:opacity-50"
                >
                  {executing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Executing Trade...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Execute Trade
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}