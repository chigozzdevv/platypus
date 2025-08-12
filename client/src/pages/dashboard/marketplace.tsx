import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { marketplaceService } from '@/services/marketplace';
import type { IPAsset } from '@/types/marketplace';

export default function Marketplace() {
  const [assets, setAssets] = useState<IPAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'base' | 'improvement'>('all');

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const response = await marketplaceService.getMarketplace();
        setAssets(response.assets);
      } catch (error) {
        console.error('Failed to load marketplace:', error);
        setAssets([]);
      } finally {
        setLoading(false);
      }
    };

    loadMarketplace();
  }, []);

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || asset.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handlePurchase = async (tokenId: string) => {
    try {
      await marketplaceService.purchaseAccess({ tokenId, periods: 1 });
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search signals by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
          >
            <option value="all">All Types</option>
            <option value="base">Base Signals</option>
            <option value="improvement">Improvements</option>
          </select>
        </div>

        {/* Results Header */}
        {filteredAssets.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              Available Signals
            </h2>
            <div className="text-sm text-neutral-500">
              <span className="font-medium">{filteredAssets.length}</span> signals found
            </div>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.tokenId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-neutral-900">{asset.symbol}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    asset.side === 'long' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {asset.side.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    asset.type === 'improvement' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-neutral-100 text-neutral-700'
                  }`}>
                    {asset.type === 'improvement' ? '⚡ Improved' : '🔹 Base'}
                  </span>
                  <div className="flex items-center text-sm text-neutral-600">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      asset.confidence >= 80 ? 'bg-green-500' : 
                      asset.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    {asset.confidence}% confidence
                  </div>
                </div>

                <p className="text-sm text-neutral-600 mb-4 line-clamp-3">{asset.description}</p>
                
                <div className="flex items-center justify-between py-3 px-4 bg-neutral-50 rounded-lg mb-4">
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Creator</p>
                    <p className="text-sm font-medium text-neutral-900">{asset.creator.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500 mb-1">Sales</p>
                    <p className="text-sm font-semibold text-neutral-900">{asset.totalSales}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-neutral-900">${asset.price}</span>
                    <span className="text-sm text-neutral-500">{asset.currency}</span>
                  </div>
                  {asset.previewOnly && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      Preview Only
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => handlePurchase(asset.tokenId)}
                  className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 text-white py-3 px-4 rounded-lg hover:from-neutral-800 hover:to-neutral-700 transition-all duration-200 font-medium flex items-center justify-center group"
                >
                  <span>Purchase Access</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAssets.length === 0 && !loading && (
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center">
            <div className="bg-neutral-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Signals Found
            </h3>
            <p className="text-neutral-600">
              No signals match your current search and filter criteria. 
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}