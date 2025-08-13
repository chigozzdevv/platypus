import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, TrendingUp, User, Eye} from 'lucide-react';
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
    const loadMarketplace = async () => {
      try {
        const response = await marketplaceService.getMarketplace({
          sortBy: sortBy === 'quality' ? 'confidence' : sortBy,
        });
        setSignals(response.signals);
      } catch (error) {
        console.error('Failed to load marketplace:', error);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    loadMarketplace();
  }, [sortBy]);

  const filteredSignals = signals.filter(signal =>
    signal.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignalClick = (signal: MarketplaceSignal) => {
    setSelectedSignal(signal);
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Improved Signals Marketplace
          </h1>
          <p className="text-neutral-600">
            Discover human-improved trading signals with enhanced analysis and better performance
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by symbol (e.g., BTC, ETH)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
          >
            <option value="newest">Newest Improvements</option>
            <option value="confidence">Highest Confidence</option>
            <option value="quality">Best Quality Score</option>
          </select>
        </div>

        {filteredSignals.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              Improved Signals
            </h2>
            <div className="text-sm text-neutral-500">
              <span className="font-medium">{filteredSignals.length}</span> improved signals available
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSignals.map((signal, index) => (
            <ImprovedSignalCard 
              key={signal.id} 
              signal={signal} 
              index={index}
              onClick={() => handleSignalClick(signal)}
            />
          ))}
        </div>

        {filteredSignals.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="bg-neutral-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Improved Signals Found
            </h3>
            <p className="text-neutral-600">
              No improved signals match your current search criteria. 
              Try adjusting your search or check back later.
            </p>
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

function ImprovedSignalCard({ 
  signal, 
  index, 
  onClick 
}: { 
  signal: MarketplaceSignal; 
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg text-neutral-900">{signal.symbol}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            signal.side === 'long' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {signal.side.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            ⚡ Improved
          </span>
          <div className="flex items-center text-sm text-neutral-600">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {signal.improvement.qualityScore}/100 quality
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              signal.confidence >= 80 ? 'bg-green-500' : 
              signal.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            {signal.confidence}% confidence
          </div>
        </div>

        <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{signal.description}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="py-2 px-3 bg-neutral-50 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">Original by</p>
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1 text-neutral-400" />
              <p className="text-sm font-medium text-neutral-900">{signal.creator.username}</p>
            </div>
          </div>
          <div className="py-2 px-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Improved by</p>
            <div className="flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-blue-500" />
              <p className="text-sm font-medium text-blue-900">{signal.improvement.creator.username}</p>
            </div>
          </div>
        </div>
        
        <div className="py-2 px-3 bg-neutral-50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Improvement Type</p>
          <p className="text-sm font-medium text-neutral-900 capitalize">
            {signal.improvement.type.replace('-', ' ')}
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-neutral-900">{signal.accessPrice}</span>
            <span className="text-sm text-neutral-500">for full access</span>
          </div>
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
            Click to preview
          </span>
        </div>
        
        <div className="flex gap-2">
          <button className="flex-1 bg-neutral-100 text-neutral-700 py-2 px-4 rounded-lg hover:bg-neutral-200 transition-colors font-medium flex items-center justify-center">
            <Eye className="w-4 h-4 mr-2" />
            Preview Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}