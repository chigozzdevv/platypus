import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { BarChart3, TrendingUp, DollarSign, Target } from 'lucide-react';
import { tradingService } from '@/services/trading';
import { useTradingStore } from '@/stores/trading-store';
import ExecuteTradeModal from '@/components/execute-trade-modal';
import type { Signal } from '@/types/signals';

export default function Trading() {
  const location = useLocation();
  const { positions, opportunities, isLoading, loadPositions, loadOpportunities } = useTradingStore();
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any>(null);

  useEffect(() => {
    loadPositions();
    loadOpportunities();
    loadAccountInfo();

    // Check if signal was pre-selected from marketplace
    if (location.state?.preSelectedSignal) {
      setSelectedSignal(location.state.preSelectedSignal);
      setShowExecuteModal(true);
    }
  }, []);

  const loadAccountInfo = async () => {
    try {
      const info = await tradingService.getAccountInfo();
      setAccountInfo(info);
    } catch (error) {
      console.error('Failed to load account info:', error);
    }
  };

  const handleExecuteTrade = (signal: Signal) => {
    setSelectedSignal(signal);
    setShowExecuteModal(true);
  };

  const handleTradeSuccess = () => {
    loadPositions();
    loadAccountInfo();
  };

  if (isLoading && !accountInfo) {
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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Trading Dashboard</h1>
          <p className="text-neutral-600">Execute trades and manage your positions</p>
        </div>

        {/* Account Overview */}
        {accountInfo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 rounded-lg p-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="mb-1">
                <p className="text-2xl font-bold text-neutral-900">
                  ${parseFloat(accountInfo.marginSummary.accountValue).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-neutral-500">Account Value</p>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="mb-1">
                <p className="text-2xl font-bold text-neutral-900">
                  ${parseFloat(accountInfo.marginSummary.totalNtlPos).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-neutral-500">Position Value</p>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 rounded-lg p-2">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="mb-1">
                <p className="text-2xl font-bold text-neutral-900">
                  ${parseFloat(accountInfo.marginSummary.totalMarginUsed).toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-neutral-500">Margin Used</p>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 rounded-lg p-2">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="mb-1">
                <p className="text-2xl font-bold text-neutral-900">{positions.length}</p>
              </div>
              <p className="text-sm text-neutral-500">Open Positions</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Positions */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Open Positions</h3>
            
            {positions.length > 0 ? (
              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-neutral-900">{position.symbol}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        position.side === 'long' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {position.side.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">${position.size.toFixed(2)}</p>
                      <p className={`text-sm ${
                        position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {position.unrealizedPnl >= 0 ? '+' : ''}${position.unrealizedPnl.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-500">No open positions</p>
              </div>
            )}
          </div>

          {/* Trading Opportunities */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Trading Opportunities</h3>
            
            {opportunities.length > 0 ? (
              <div className="space-y-3">
                {opportunities.slice(0, 5).map((opportunity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-neutral-900">{opportunity.symbol}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        opportunity.setup.direction === 'LONG' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {opportunity.setup.direction}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">{opportunity.setup.confidence}%</p>
                      <p className="text-sm text-neutral-500">Score: {opportunity.score.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <p className="text-neutral-500">No opportunities found</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {selectedSignal && (
        <ExecuteTradeModal
          signal={selectedSignal}
          isOpen={showExecuteModal}
          onClose={() => {
            setShowExecuteModal(false);
            setSelectedSignal(null);
          }}
          onSuccess={handleTradeSuccess}
        />
      )}
    </div>
  );
}