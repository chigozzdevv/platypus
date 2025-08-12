import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, BarChart3 } from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { marketplaceService } from '@/services/marketplace';
import type { RevenueData} from '@/types/analytics';
import type { UserAsset } from '@/types/marketplace';
import { formatCurrency } from '@/utils/format';

export default function Royalties() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [userAssets, setUserAssets] = useState<UserAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [revenue, assets] = await Promise.all([
          analyticsService.getRevenue(),
          marketplaceService.getUserAssets()
        ]);
        
        setRevenueData(revenue);
        setUserAssets(assets.assets);
      } catch (error) {
        console.error('Failed to load revenue data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      </div>
    );
  }

  if (!revenueData) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <p className="text-neutral-500">Failed to load revenue data.</p>
        </div>
      </div>
    );
  }

  const lastMonthRevenue = revenueData.monthlyBreakdown[revenueData.monthlyBreakdown.length - 1]?.revenue || 0;
  const previousMonthRevenue = revenueData.monthlyBreakdown[revenueData.monthlyBreakdown.length - 2]?.revenue || 0;
  const monthlyGrowth = previousMonthRevenue > 0 
    ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Royalties & Earnings</h1>
          <p className="text-neutral-600">Track your revenue from signal creation and improvements</p>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-2">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className={`text-sm font-medium ${
                monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(revenueData.totalRevenue)}
              </p>
            </div>
            <p className="text-sm text-neutral-500">Total Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(revenueData.ipRevenue)}
              </p>
            </div>
            <p className="text-sm text-neutral-500">IP Sales Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-lg p-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">
                {formatCurrency(revenueData.royaltyRevenue)}
              </p>
            </div>
            <p className="text-sm text-neutral-500">Improvement Royalties</p>
          </motion.div>
        </div>

        {/* Monthly Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-lg border border-neutral-200 p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Monthly Revenue</h3>
          <div className="space-y-3">
            {revenueData.monthlyBreakdown.slice(-6).reverse().map((month) => (
              <div key={month.month} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span className="font-medium text-neutral-900">{month.month}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-neutral-900">
                    {formatCurrency(month.revenue)}
                  </p>
                  <p className="text-sm text-neutral-500">{month.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Your IP Assets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-lg border border-neutral-200 p-6"
        >
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your IP Assets</h3>
          
          {userAssets.length > 0 ? (
            <div className="space-y-4">
              {userAssets.map((asset) => (
                <div key={asset.tokenId} className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg">
                  <div>
                    <h4 className="font-medium text-neutral-900">{asset.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        asset.type === 'improvement' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {asset.type === 'improvement' ? 'Improvement' : 'Base Signal'}
                      </span>
                      <span className="text-sm text-neutral-500">
                        {asset.totalSales} sales
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(asset.revenue)}
                    </p>
                    <p className="text-sm text-neutral-500">Total earned</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-neutral-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-neutral-600" />
              </div>
              <h4 className="text-lg font-medium text-neutral-900 mb-2">No IP Assets Yet</h4>
              <p className="text-neutral-600">
                Create signals or improve existing ones to start earning royalties
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}