import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Zap, Plus } from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { signalsService } from '@/services/signals';
import type { Signal } from '@/types/signals';
import type { PlatformAnalytics } from '@/types/analytics';

export default function Overview() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsData, signalsData] = await Promise.all([
          analyticsService.getOverview(),
          signalsService.getUserSignals({ limit: 3 })
        ]);
        
        setAnalytics(analyticsData);
        setRecentSignals(signalsData.signals);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
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

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-neutral-100 rounded-lg p-2">
                <Zap className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">
                {analytics?.totalSignals || '0'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">Total Signals</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-neutral-100 rounded-lg p-2">
                <TrendingUp className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">
                {analytics?.avgSignalAccuracy?.toFixed(1) || '0'}%
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">Average Accuracy</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-neutral-100 rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">
                ${analytics?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">Total Revenue</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-neutral-100 rounded-lg p-2">
                <Users className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">
                {analytics?.totalIPAssets || '0'}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">IP Assets</p>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Recent Signals */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Signals</h3>
              <Link 
                to="/dashboard/my-signals" 
                className="text-sm text-neutral-600 hover:text-neutral-900"
              >
                View all
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentSignals.length > 0 ? (
                recentSignals.map((signal) => (
                  <div key={signal.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-neutral-900">{signal.symbol}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        signal.side === 'long' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {signal.side.toUpperCase()}
                      </span>
                      <span className="text-sm text-neutral-500">{signal.confidence}%</span>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs font-medium text-green-600">
                        {signal.registeredAsIP ? 'IP Registered' : 'Active'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-neutral-500 text-sm">No signals created yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              <Link
                to="/dashboard/signals"
                className="flex items-center p-3 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <div className="bg-green-100 rounded-lg p-2 mr-3">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Improve AI Signals</p>
                  <p className="text-sm text-neutral-500">Improve AI trading signals for IP</p>
                </div>
              </Link>
              
              <Link
                to="/dashboard/marketplace"
                className="flex items-center p-3 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <div className="bg-blue-100 rounded-lg p-2 mr-3">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Browse Marketplace</p>
                  <p className="text-sm text-neutral-500">Find improved signals</p>
                </div>
              </Link>
              
              <Link
                to="/dashboard/royalties"
                className="flex items-center p-3 rounded-md border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <div className="bg-yellow-100 rounded-lg p-2 mr-3">
                  <TrendingUp className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">View Earnings</p>
                  <p className="text-sm text-neutral-500">Track your revenue</p>
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}