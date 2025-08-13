import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Zap } from 'lucide-react';
import { signalsService } from '@/services/signals';
import type { Signal, ImproveSignalRequest } from '@/types/signals';

interface ImprovementModalProps {
  signal: Signal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImprovementModal({ signal, isOpen, onClose, onSuccess }: ImprovementModalProps) {
  const [improvementData, setImprovementData] = useState<ImproveSignalRequest>({
    improvementType: 'entry-adjustment',
    originalValue: signal.entryPrice,
    improvedValue: signal.entryPrice,
    reasoning: ''
  });
  const [qualityScore, setQualityScore] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [minting, setMinting] = useState(false);
  const [canMint, setCanMint] = useState(false);

  const handleImprovementChange = (field: keyof ImproveSignalRequest, value: any) => {
    setImprovementData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset quality score when data changes
    setQualityScore(null);
    setCanMint(false);
  };

  const checkImprovementQuality = async () => {
    setChecking(true);
    try {
      // Submit improvement first to get quality score
      await signalsService.improveSignal(signal.id, improvementData);
      
      // Simulate quality assessment (in real implementation, this would come from the server)
      const score = calculateQualityScore(improvementData);
      setQualityScore(score);
      setCanMint(score >= 50);
      
      if (score >= 50) {
        onSuccess(); // Refresh parent data
      }
    } catch (error: any) {
      console.error('Failed to submit improvement:', error);
      if (error.message.includes('quality too low')) {
        const scoreMatch = error.message.match(/\((\d+)\/100\)/);
        if (scoreMatch) {
          setQualityScore(parseInt(scoreMatch[1]));
          setCanMint(false);
        }
      }
    } finally {
      setChecking(false);
    }
  };

  const handleMintImprovement = async () => {
    setMinting(true);
    try {
      // Find the improvement index (it should be the last one added)
      const updatedSignal = await signalsService.getSignal(signal.id);
      const improvementIndex = (updatedSignal.signal.improvements?.length || 1) - 1;
      
      await signalsService.mintImprovement(signal.id, improvementIndex);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to mint improvement:', error);
    } finally {
      setMinting(false);
    }
  };

  const calculateQualityScore = (improvement: ImproveSignalRequest): number => {
    let score = 0;
    
    // Reasoning quality (40 points)
    if (improvement.reasoning.length >= 50) score += 20;
    if (improvement.reasoning.length >= 100) score += 10;
    if (improvement.reasoning.length >= 150) score += 10;
    
    // Value change significance (30 points)
    const changePercent = Math.abs((improvement.improvedValue - improvement.originalValue) / improvement.originalValue);
    if (changePercent > 0.01) score += 15; // > 1% change
    if (changePercent > 0.02) score += 15; // > 2% change
    
    // Technical keywords (20 points)
    const technicalTerms = ['support', 'resistance', 'volume', 'momentum', 'rsi', 'macd', 'fibonacci'];
    const termsUsed = technicalTerms.filter(term => 
      improvement.reasoning.toLowerCase().includes(term)
    ).length;
    score += Math.min(20, termsUsed * 3);
    
    // Grammar and structure (10 points)
    if (improvement.reasoning.includes('.')) score += 5;
    if (improvement.reasoning.split(' ').length >= 15) score += 5;
    
    return Math.min(100, score);
  };

  const getOriginalValue = () => {
    switch (improvementData.improvementType) {
      case 'entry-adjustment': return signal.entryPrice;
      case 'stop-loss-adjustment': return signal.stopLoss;
      case 'take-profit-adjustment': return signal.takeProfit;
      case 'analysis-enhancement': return signal.analysis.technicalAnalysis;
      default: return 0;
    }
  };

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
            className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Improve Signal</h2>
                <p className="text-sm text-neutral-600">{signal.symbol} - Add your expertise</p>
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
                {/* Improvement Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Improvement Type
                  </label>
                  <select
                    value={improvementData.improvementType}
                    onChange={(e) => handleImprovementChange('improvementType', e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="entry-adjustment">Entry Price Adjustment</option>
                    <option value="stop-loss-adjustment">Stop Loss Adjustment</option>
                    <option value="take-profit-adjustment">Take Profit Adjustment</option>
                    <option value="analysis-enhancement">Analysis Enhancement</option>
                  </select>
                </div>

                {/* Value Adjustment */}
                {improvementData.improvementType !== 'analysis-enhancement' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Original Value
                      </label>
                      <input
                        type="number"
                        value={getOriginalValue()}
                        disabled
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Improved Value
                      </label>
                      <input
                        type="number"
                        value={improvementData.improvedValue}
                        onChange={(e) => handleImprovementChange('improvedValue', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Improvement Reasoning
                  </label>
                  <textarea
                    value={improvementData.reasoning}
                    onChange={(e) => handleImprovementChange('reasoning', e.target.value)}
                    placeholder="Explain your improvement with technical analysis, market insights, or other relevant factors..."
                    rows={6}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-neutral-500 mt-1">
                    {improvementData.reasoning.length}/1000 characters
                  </p>
                </div>

                {/* Quality Assessment Result */}
                {qualityScore !== null && (
                  <div className={`p-4 rounded-lg border ${
                    qualityScore >= 50 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {qualityScore >= 50 ? (
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      )}
                      <h3 className={`font-semibold ${
                        qualityScore >= 50 ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Quality Assessment: {qualityScore}/100
                      </h3>
                    </div>
                    <p className={`text-sm ${
                      qualityScore >= 50 ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {qualityScore >= 50 
                        ? 'Great! Your improvement meets quality standards and can be minted as IP.'
                        : 'Quality too low. Please provide more detailed reasoning and substantial improvements.'
                      }
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {qualityScore === null ? (
                    <button
                      onClick={checkImprovementQuality}
                      disabled={checking || !improvementData.reasoning.trim()}
                      className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      {checking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Checking Quality...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Check Improvement Impact
                        </>
                      )}
                    </button>
                  ) : canMint ? (
                    <button
                      onClick={handleMintImprovement}
                      disabled={minting}
                      className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      {minting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Minting IP...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Mint as Derivative IP
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQualityScore(null);
                        setCanMint(false);
                      }}
                      className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      Revise Improvement
                    </button>
                  )}
                  
                  <button
                    onClick={onClose}
                    className="px-6 py-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}