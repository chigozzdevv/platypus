import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import SignalCard from '@/components/signal-card';
import ImprovementModal from '@/components/improvement-modal';
import Button from '@/components/button';
import { signalsService } from '@/services/signals';
import type { Signal } from '@/types/signals';

export default function Signals() {
  const [improvableSignals, setImprovableSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [filters, setFilters] = useState({
    symbol: '',
    minConfidence: 0,
    sortBy: 'newest' as 'newest' | 'confidence' | 'performance'
  });

  useEffect(() => {
    loadImprovableSignals();
  }, [filters]);

  const loadImprovableSignals = async () => {
    try {
      const response = await signalsService.getImprovableSignals({
        symbol: filters.symbol || undefined,
        minConfidence: filters.minConfidence || undefined,
        sortBy: filters.sortBy
      });
      setImprovableSignals(response.signals);
    } catch (error) {
      console.error('Failed to load improvable signals:', error);
      setImprovableSignals([]);
    } finally {
      setLoading(false);
    }
  };


  const handleImproveSignal = (signalId: string) => {
    const signal = improvableSignals.find(s => s.id === signalId);
    if (signal) {
      setSelectedSignal(signal);
      setShowImprovementModal(true);
    }
  };

  const handleImprovementSuccess = () => {
    loadImprovableSignals(); // Refresh the list
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
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Filter by symbol (e.g. BTC, ETH)"
              value={filters.symbol}
              onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <select
              value={filters.minConfidence}
              onChange={(e) => setFilters(prev => ({ ...prev, minConfidence: Number(e.target.value) }))}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Any Confidence</option>
              <option value={70}>70%+ Confidence</option>
              <option value={80}>80%+ Confidence</option>
              <option value={90}>90%+ Confidence</option>
            </select>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="confidence">Highest Confidence</option>
              <option value="performance">Best Performance</option>
            </select>
          </div>
          
          <Button 
            variant="outline" 
            onClick={loadImprovableSignals}
            disabled={loading}
            className="flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>


        {/* Improvable Signals */}
        {improvableSignals.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Available Signals
              </h2>
              <div className="text-sm text-neutral-500">
                <span className="font-medium">{improvableSignals.length}</span> fresh signals • Last 24h
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {improvableSignals.map((signal, index) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <SignalCard
                    signal={signal}
                    onView={() => console.log('View signal:', signal.id)}
                    onImprove={() => handleImproveSignal(signal.id)}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <div className="bg-neutral-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Signals Available
            </h3>
            <p className="text-neutral-600">
              No fresh signals match your current filters. 
              Try adjusting your criteria or check back later.
            </p>
          </div>
        )}

      </motion.div>

      {/* Improvement Modal */}
      {selectedSignal && (
        <ImprovementModal
          isOpen={showImprovementModal}
          onClose={() => {
            setShowImprovementModal(false);
            setSelectedSignal(null);
          }}
          signal={selectedSignal}
          onSuccess={handleImprovementSuccess}
        />
      )}
    </div>
  );
}