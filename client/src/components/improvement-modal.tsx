import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp } from 'lucide-react';
import type { Signal } from '@/types/signals';
import { signalsService } from '@/services/signals';
import Button from './button';

interface ImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: Signal;
  onSuccess?: () => void;
}

export default function ImprovementModal({ isOpen, onClose, signal, onSuccess }: ImprovementModalProps) {
  const [improvementType, setImprovementType] = useState<'entry-adjustment' | 'stop-loss-adjustment' | 'take-profit-adjustment' | 'analysis-enhancement'>('entry-adjustment');
  const [originalValue, setOriginalValue] = useState<number>(signal.entryPrice);
  const [improvedValue, setImprovedValue] = useState<number>(signal.entryPrice);
  const [reasoning, setReasoning] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleTypeChange = (type: typeof improvementType) => {
    setImprovementType(type);
    switch (type) {
      case 'entry-adjustment':
        setOriginalValue(signal.entryPrice);
        setImprovedValue(signal.entryPrice);
        break;
      case 'stop-loss-adjustment':
        setOriginalValue(signal.stopLoss || 0);
        setImprovedValue(signal.stopLoss || 0);
        break;
      case 'take-profit-adjustment':
        setOriginalValue(signal.takeProfit || 0);
        setImprovedValue(signal.takeProfit || 0);
        break;
      case 'analysis-enhancement':
        setOriginalValue(0);
        setImprovedValue(0);
        break;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await signalsService.improveSignal(signal.id, {
        improvementType,
        originalValue,
        improvedValue,
        reasoning,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to submit improvement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getImprovementDescription = () => {
    switch (improvementType) {
      case 'entry-adjustment':
        return 'Optimize the entry price for better risk/reward ratio';
      case 'stop-loss-adjustment':
        return 'Improve risk management with better stop-loss placement';
      case 'take-profit-adjustment':
        return 'Enhance profit targets based on technical levels';
      case 'analysis-enhancement':
        return 'Add additional market insights and analysis';
    }
  };

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
              <h2 className="text-2xl font-bold text-neutral-900">Improve Signal</h2>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Signal Summary */}
            <div className="bg-neutral-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{signal.symbol}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  signal.side === 'long' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {signal.side.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-neutral-600">{signal.confidence}% confidence</p>
            </div>

            {/* Improvement Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Improvement Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'entry-adjustment', label: 'Entry Price' },
                  { value: 'stop-loss-adjustment', label: 'Stop Loss' },
                  { value: 'take-profit-adjustment', label: 'Take Profit' },
                  { value: 'analysis-enhancement', label: 'Analysis' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTypeChange(option.value as any)}
                    className={`p-3 text-sm rounded-md border transition-colors ${
                      improvementType === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                {getImprovementDescription()}
              </p>
            </div>

            {/* Value Inputs */}
            {improvementType !== 'analysis-enhancement' && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Original Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalValue}
                    onChange={(e) => setOriginalValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Improved Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={improvedValue}
                    onChange={(e) => setImprovedValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                  />
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Reasoning *
              </label>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                placeholder="Explain why this improvement makes the signal better..."
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Detailed reasoning helps achieve higher quality scores (50+ required for approval)
              </p>
            </div>

            {/* Revenue Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-sm text-green-800">
                  <strong>60% royalty</strong> on all future sales of your improvement
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || !reasoning.trim() || (improvementType !== 'analysis-enhancement' && improvedValue === originalValue)}
                className="flex-1"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Submit Improvement'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}