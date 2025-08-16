import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Eye, BarChart3, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '@/services/marketplace';
import { campService } from '@/services/camp';
import type { MarketplaceSignal } from '@/types/marketplace';
import type { Signal } from '@/types/signals';

interface SignalDetailModalProps {
  signal: MarketplaceSignal;
  isOpen: boolean;
  onClose: () => void;
}

export default function SignalDetailModal({ signal, isOpen, onClose }: SignalDetailModalProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  const canPurchase = useMemo(
    () => hasAccess === false && !!signal.improvement.ipTokenId && !purchasing,
    [hasAccess, signal.improvement.ipTokenId, purchasing]
  );

  useEffect(() => {
    const run = async () => {
      if (signal.improvement.ipTokenId) {
        const { hasAccess } = await marketplaceService.checkImprovementAccess(signal.improvement.ipTokenId);
        setHasAccess(hasAccess);
      } else {
        setHasAccess(false);
      }
      setTxHash(undefined);
    };
    if (isOpen) run();
  }, [signal.improvement.ipTokenId, isOpen]);

  const handlePurchaseAccess = async () => {
    if (!signal.improvement.ipTokenId) return;
    setPurchasing(true);
    try {
      const { transactionHash } = await marketplaceService.purchaseImprovementAccess(signal.improvement.ipTokenId);
      if (transactionHash) setTxHash(transactionHash);
      const recheck = await marketplaceService.checkImprovementAccess(signal.improvement.ipTokenId);
      setHasAccess(recheck.hasAccess);
    } catch {
      setHasAccess(false);
    } finally {
      setPurchasing(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/dashboard/signals/${signal.id}`);
    onClose();
  };

  const handleTrade = () => {
    const full: Signal | undefined = signal.fullSignal as any;
    const payload = full
      ? full
      : {
          id: signal.id,
          symbol: signal.symbol,
          side: signal.side,
          entryPrice: 0,
          confidence: signal.confidence,
          analysis: { technicalAnalysis: '', marketAnalysis: '', sentimentAnalysis: '', riskAssessment: '' },
          registeredAsIP: false,
          creator: { id: signal.creator?.id || '', username: signal.creator?.username || '', reputation: 0 },
          createdAt: signal.createdAt,
          updatedAt: signal.createdAt,
          expiresAt: signal.createdAt,
          status: 'active',
        } as Signal;

    navigate(`/dashboard/trading`, { state: { preSelectedSignal: payload } });
    onClose();
  };

  const explorerUrl = txHash ? campService.explorerTxUrl(txHash) : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-3xl rounded-xl border border-neutral-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">{signal.symbol} Improved Signal</h2>
                <p className="text-sm text-neutral-500">Review signal details and purchase access</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 active:scale-95 transition" aria-label="Close">
                <X className="w-5 h-5 text-neutral-700" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6 max-h-[72vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-neutral-200 p-4">
                  <div className="text-sm text-neutral-500">Direction</div>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-sm font-medium ${signal.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {signal.side.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-neutral-200 p-4">
                  <div className="text-sm text-neutral-500">Confidence</div>
                  <div className="mt-1 font-medium text-neutral-900">{signal.confidence}%</div>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="font-semibold text-neutral-900 mb-2">Human Improvement</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-500">Type</div>
                    <div className="font-medium text-neutral-900 capitalize">{signal.improvement.type?.replace('-', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500">Quality</div>
                    <div className="font-medium text-neutral-900">{signal.improvement.qualityScore}/100</div>
                  </div>
                </div>
                <div className="mt-3 text-sm">
                  <div className="text-neutral-500">Improved by</div>
                  <div className="font-medium text-neutral-900">{signal.improvement.creator?.username || 'Unknown'}</div>
                </div>
              </div>

              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="font-semibold text-neutral-900 mb-2">Signal Preview</div>
                <p className="text-sm text-neutral-700">{signal.description}</p>
                {!hasAccess && (
                  <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-900">
                    🔒 Full levels and detailed reasoning unlock after purchase
                  </div>
                )}
                {hasAccess && txHash && (
                  <a href={explorerUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View transaction
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-neutral-200">
              {!hasAccess ? (
                <>
                  <div className="text-sm text-neutral-500">Price: <span className="font-medium text-neutral-900">{signal.accessPrice}</span></div>
                  <button
                    onClick={handlePurchaseAccess}
                    disabled={!canPurchase}
                    className="inline-flex items-center justify-center rounded-lg bg-neutral-900 px-5 py-2.5 text-white font-medium hover:bg-neutral-800 disabled:opacity-60"
                  >
                    {purchasing ? (
                      <span className="inline-flex items-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-b-transparent" />
                        Processing…
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Purchase Access
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <div className="flex w-full items-center justify-end gap-3">
                  <button
                    onClick={handleViewDetails}
                    className="inline-flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-neutral-800 font-medium hover:bg-neutral-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                  <button
                    onClick={handleTrade}
                    className="inline-flex items-center justify-center rounded-lg bg-green-600 px-5 py-2.5 text-white font-medium hover:bg-green-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Trade Signal
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}