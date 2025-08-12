import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
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
      // Refresh marketplace or show success message
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Marketplace</h1>
          <p className="text-neutral-600">Discover and purchase improved trading signals</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="border border-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                <option value="all">All Types</option>
                <option value="base">Base Signals</option>
                <option value="improvement">Improvements</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.tokenId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-lg border border-neutral-200 p-6"
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{asset.symbol}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.side === 'long' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {asset.side.toUpperCase()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.type === 'improvement' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {asset.type === 'improvement' ? 'Improved' : 'Base'}
                  </span>
                  <span className="text-sm text-neutral-500">
                    {asset.confidence}% confidence
                  </span>
                </div>

                <p className="text-sm text-neutral-600 mb-4">{asset.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-neutral-500">Creator</p>
                    <p className="text-sm font-medium">{asset.creator.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Sales</p>
                    <p className="text-sm font-medium">{asset.totalSales}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">${asset.price} {asset.currency}</span>
                  {asset.previewOnly && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Preview Only
                    </span>
                  )}
                </div>
                
                <button
                  onClick={() => handlePurchase(asset.tokenId)}
                  className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 transition-colors font-medium"
                >
                  Purchase Access
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredAssets.length === 0 && (
          <div className="text-center py-16">
            <p className="text-neutral-500">No signals found matching your criteria.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}