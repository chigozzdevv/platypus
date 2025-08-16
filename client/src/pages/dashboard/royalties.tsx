import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Calendar, BarChart3, Download, RefreshCw, Star, Zap } from 'lucide-react';
import { campService } from '@/services/camp';
import { signalsService } from '@/services/signals';
import { useAuthStore } from '@/stores/auth-store';
import { formatCurrency } from '@/utils/format';
import type { Signal } from '@/types/signals';

interface RoyaltyData {
  totalEarned: number;
  claimableAmount: number;
  totalClaims: number;
  monthlyBreakdown: Array<{
    month: string;
    earnings: number;
    claims: number;
  }>;
}

interface UserIPAsset {
  id: string;
  tokenId: string;
  name: string;
  type: 'signal' | 'improvement';
  symbol: string;
  confidence: number;
  totalEarnings: number;
  totalSales: number;
  monthlyEarnings: number;
  createdAt: string;
  isActive: boolean;
}

export default function Royalties() {
  const { user } = useAuthStore();
  const [royaltyData, setRoyaltyData] = useState<RoyaltyData | null>(null);
  const [ipAssets, setIPAssets] = useState<UserIPAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRoyaltyData();
  }, []);

  const parseAmount = (s: string | number | null | undefined) => {
    if (typeof s === 'number') return isFinite(s) ? s : 0;
    if (!s) return 0;
    const n = parseFloat(String(s)); // handles "0.1234 CAMP" etc.
    return isNaN(n) ? 0 : n;
  };

  const loadRoyaltyData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadRoyaltyBalance(), loadUserIPAssets()]);
    } catch (error) {
      console.error('Failed to load royalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoyaltyBalance = async () => {
    try {
      const balanceStr = await campService.getRoyaltyBalance();
      const total = parseAmount(balanceStr);
      const realData: RoyaltyData = {
        totalEarned: total,
        claimableAmount: total * 0.15,
        totalClaims: 0,
        monthlyBreakdown: [],
      };
      setRoyaltyData(realData);
    } catch (error) {
      console.error('Failed to load royalty balance:', error);
    }
  };

  const loadUserIPAssets = async () => {
    try {
      const userSignals = await signalsService.getUserSignals();
      const assets: UserIPAsset[] = [];

      userSignals.signals
        .filter((signal: Signal) => signal.registeredAsIP && signal.ipTokenId)
        .forEach((signal: Signal) => {
          assets.push({
            id: signal.id,
            tokenId: signal.ipTokenId!,
            name: `${signal.symbol} Base Signal`,
            type: 'signal',
            symbol: signal.symbol,
            confidence: signal.confidence,
            totalEarnings: 0,
            totalSales: signal.totalUsage || 0,
            monthlyEarnings: 0,
            createdAt: signal.createdAt,
            isActive: !signalsService.isSignalExpired(signal),
          });

          signal.improvements?.forEach((improvement) => {
            if (improvement.registeredAsIP && improvement.ipTokenId && improvement.creator.id === user?.id) {
              assets.push({
                id: improvement.id,
                tokenId: improvement.ipTokenId,
                name: `${signal.symbol} Improvement`,
                type: 'improvement',
                symbol: signal.symbol,
                confidence: signal.confidence,
                totalEarnings: 0,
                totalSales: 0,
                monthlyEarnings: 0,
                createdAt: improvement.createdAt,
                isActive: !signalsService.isSignalExpired(signal),
              });
            }
          });
        });

      setIPAssets(assets);
    } catch (error) {
      console.error('Failed to load IP assets:', error);
    }
  };

  const handleClaimRoyalties = async () => {
    setClaiming(true);
    try {
      await campService.claimRoyalties();
      await loadRoyaltyData();
    } catch (error) {
      console.error('Failed to claim royalties:', error);
      if (royaltyData) {
        setRoyaltyData({
          ...royaltyData,
          totalEarned: royaltyData.totalEarned + royaltyData.claimableAmount,
          claimableAmount: 0,
          totalClaims: royaltyData.totalClaims + 1,
        });
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRoyaltyData();
    setRefreshing(false);
  };

  const exportRoyaltyData = () => {
    const csvData = ipAssets.map((asset) => ({
      'Asset Name': asset.name,
      Type: asset.type,
      Symbol: asset.symbol,
      'Total Earnings': asset.totalEarnings,
      'Total Sales': asset.totalSales,
      'Monthly Earnings': asset.monthlyEarnings,
      Created: new Date(asset.createdAt).toLocaleDateString(),
      Status: asset.isActive ? 'Active' : 'Expired',
    }));

    if (csvData.length === 0) return;

    const csvContent = [Object.keys(csvData[0]).join(','), ...csvData.map((row) => Object.values(row).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'royalty-report.csv';
    a.click();
    URL.revokeObjectURL(url);
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

  if (!royaltyData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <p className="text-neutral-500">Failed to load royalty data.</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const monthlyGrowth =
    royaltyData.monthlyBreakdown.length >= 2
      ? ((royaltyData.monthlyBreakdown[royaltyData.monthlyBreakdown.length - 1].earnings -
          royaltyData.monthlyBreakdown[royaltyData.monthlyBreakdown.length - 2].earnings) /
          royaltyData.monthlyBreakdown[royaltyData.monthlyBreakdown.length - 2].earnings) *
        100
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Royalties & Earnings</h1>
            <p className="text-neutral-600">Track your revenue from signal creation and improvements</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportRoyaltyData}
              className="flex items-center px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <span className={`text-sm font-medium ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyGrowth >= 0 ? '+' : ''}
                {monthlyGrowth.toFixed(1)}%
              </span>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(royaltyData.totalEarned)}</p>
            </div>
            <p className="text-sm text-neutral-500">Total Earned</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">{formatCurrency(royaltyData.claimableAmount)}</p>
            </div>
            <p className="text-sm text-neutral-500">Available to Claim</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">{ipAssets.length}</p>
            </div>
            <p className="text-sm text-neutral-500">Active IP Assets</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-lg border border-neutral-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 rounded-lg p-2">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">{royaltyData.totalClaims}</p>
            </div>
            <p className="text-sm text-neutral-500">Total Claims</p>
          </motion.div>
        </div>

        {royaltyData.claimableAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-1">Royalties Ready to Claim</h3>
                <p className="text-green-700">
                  You have {formatCurrency(royaltyData.claimableAmount)} available to claim from your IP sales
                </p>
              </div>

              <button
                onClick={handleClaimRoyalties}
                disabled={claiming}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center disabled:opacity-50"
              >
                {claiming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Claiming...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Claim Royalties
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="lg:col-span-1 bg-white rounded-lg border border-neutral-200 p-6"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Monthly Earnings</h3>
            <div className="space-y-4">
              {royaltyData.monthlyBreakdown.slice(-6).reverse().map((month) => (
                <div key={month.month} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span className="font-medium text-neutral-900">{month.month}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-neutral-900">{formatCurrency(month.earnings)}</p>
                    <p className="text-sm text-neutral-500">{month.claims} claims</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-6"
          >
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your IP Assets</h3>

            {ipAssets.length > 0 ? (
              <div className="space-y-4">
                {ipAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${asset.type === 'improvement' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                        {asset.type === 'improvement' ? (
                          <Zap className="w-5 h-5 text-purple-600" />
                        ) : (
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      <div>
                        <h4 className="font-medium text-neutral-900">{asset.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              asset.type === 'improvement' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {asset.type === 'improvement' ? 'Improvement' : 'Base Signal'}
                          </span>
                          <span className="text-sm text-neutral-500">{asset.confidence}% confidence</span>
                          <span className="text-sm text-neutral-500">{asset.totalSales} sales</span>
                          {!asset.isActive && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Expired</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-green-600">{formatCurrency(asset.totalEarnings)}</p>
                      <p className="text-sm text-neutral-500">+{formatCurrency(asset.monthlyEarnings)} this month</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-neutral-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="w-8 h-8 text-neutral-600" />
                </div>
                <h4 className="text-lg font-medium text-neutral-900 mb-2">No IP Assets Yet</h4>
                <p className="text-neutral-600 mb-4">Create signals or improve existing ones to start earning royalties</p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => (window.location.href = '/dashboard/signals')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Improve Signals
                  </button>
                  <button
                    onClick={() => (window.location.href = '/dashboard/marketplace')}
                    className="px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Browse Marketplace
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}