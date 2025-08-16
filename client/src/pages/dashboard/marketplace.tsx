import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { marketplaceService } from '@/services/marketplace';
import SignalDetailModal from '@/components/signal-detail-modal';
import type { MarketplaceSignal } from '@/types/marketplace';

export default function Marketplace() {
  const [signals, setSignals] = useState<MarketplaceSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'confidence' | 'quality'>('newest');
  const [selectedSignal, setSelectedSignal] = useState<MarketplaceSignal | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await marketplaceService.getMarketplace({
          sortBy: sortBy === 'quality' ? 'confidence' : sortBy,
          hideOwned: true,
        });
        setSignals(resp.signals);
      } catch {
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [sortBy]);

  const filtered = useMemo(
    () => signals.filter(s => s.symbol.toLowerCase().includes(searchTerm.toLowerCase())),
    [signals, searchTerm]
  );

  const openSignal = (s: MarketplaceSignal) => {
    setSelectedSignal(s);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by symbol (e.g., BTC, ETH)…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 sm:min-w-40 w-full sm:w-auto"
          >
            <option value="newest">Newest Improvements</option>
            <option value="confidence">Highest Confidence</option>
            <option value="quality">Best Quality Score</option>
          </select>
        </div>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Improved Signals</h2>
            <div className="text-sm text-neutral-500">
              <span className="font-medium">{filtered.length}</span> available
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onClick={() => openSignal(s)}
              className="text-left rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-neutral-900">{s.symbol}</div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.side.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-neutral-500">{new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-neutral-50 rounded-md p-3">
                  <div className="text-neutral-500">Confidence</div>
                  <div className="font-medium text-neutral-900">{s.confidence}%</div>
                </div>
                <div className="bg-neutral-50 rounded-md p-3">
                  <div className="text-neutral-500">Quality</div>
                  <div className="font-medium text-neutral-900">{s.improvement.qualityScore}/100</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-neutral-600 line-clamp-2">{s.description}</div>
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Improved Signals</h3>
            <p className="text-neutral-600">Nothing matches your search right now.</p>
          </div>
        )}
      </motion.div>

      {selectedSignal && (
        <SignalDetailModal
          signal={selectedSignal}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSignal(null);
          }}
        />
      )}
    </div>
  );
}