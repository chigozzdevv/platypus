import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, DollarSign, Eye, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplace';
import type { MarketplaceSignal } from '@/types/marketplace';

interface SignalDetailModalProps {
  signal: MarketplaceSignal;
  isOpen: boolean;
  onClose: () => void;
}

export default function SignalDetailModal({ signal, isOpen, onClose }: SignalDetailModalProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      if (signal.improvement.ipTokenId) {
        const { hasAccess } = await marketplaceService.checkImprovementAccess(signal.improvement.ipTokenId);
        setHasAccess(hasAccess);
      }
    };
    if (isOpen) {
      checkAccess();
    }
  }, [signal.improvement.ipTokenId, isOpen]);

  const handlePurchaseAccess = async () => {
    if (!signal.improvement.ipTokenId) return;
    
    setPurchasing(true);
    try {
      await marketplaceService.purchaseImprovementAccess(signal.improvement.ipTokenId);
      setHasAccess(true);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/signals/${signal.id}`);
    onClose();
  };

  const handleTrade = () => {
    navigate(`/dashboard/trading`, { state: { preSelectedSignal: signal } });
    onClose();
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
                <h2 className="text-xl font-bold text-neutral-900">{signal.symbol} Improved Signal</h2>
                <p className="text-sm text-neutral-600">Review signal details and purchase access</p>
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
                {/* Signal Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-sm text-neutral-500 mb-1">Direction</p>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        signal.side === 'long' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {signal.side.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-sm text-neutral-500 mb-1">Confidence</p>
                    <p className="text-lg font-bold text-neutral-900">{signal.confidence}%</p>
                  </div>
                </div>

                {/* Improvement Details */}
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">Human Improvement</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-purple-600 mb-1">Improvement Type</p>
                      <p className="font-medium text-purple-900 capitalize">
                        {signal.improvement.type.replace('-', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-purple-600 mb-1">Quality Score</p>
                      <p className="font-medium text-purple-900">{signal.improvement.qualityScore}/100</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-purple-600 mb-1">Improved by</p>
                    <p className="font-medium text-purple-900">{signal.improvement.creator.username}</p>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="border border-neutral-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-neutral-900 mb-3">Signal Preview</h3>
                  <p className="text-sm text-neutral-600 mb-4">{signal.description}</p>
                  
                  {!hasAccess && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        🔒 Complete trading levels, detailed analysis, and improvement reasoning available after purchase
                      </p>
                    </div>
                  )}
                </div>

                {/* Access Status & Actions */}
                <div className="border-t border-neutral-200 pt-6">
                  {hasAccess ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center text-sm text-green-700 bg-green-50 py-3 rounded-lg">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Full Access Granted - All signal details available
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleViewDetails}
                          className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Full Details
                        </button>
                        
                        <button
                          onClick={handleTrade}
                          className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Trade Signal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900 mb-1">{signal.accessPrice}</p>
                        <p className="text-sm text-neutral-600">One-time purchase for lifetime access</p>
                      </div>
                      
                      <button
                        onClick={handlePurchaseAccess}
                        disabled={purchasing || !signal.improvement.ipTokenId}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium flex items-center justify-center disabled:opacity-50"
                      >
                        {purchasing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing Purchase...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-5 h-5 mr-2" />
                            Purchase Full Access
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}