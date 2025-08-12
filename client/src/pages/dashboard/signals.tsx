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
  const [creating, setCreating] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [showImprovementModal, setShowImprovementModal] = useState(false);

  useEffect(() => {
    loadImprovableSignals();
  }, []);

  const loadImprovableSignals = async () => {
    try {
      const response = await signalsService.getImprovableSignals();
      setImprovableSignals(response.signals);
    } catch (error) {
      console.error('Failed to load improvable signals:', error);
      setImprovableSignals([]);
    } finally {
      setLoading(false);
    }
  };

  const createNewSignal = async () => {
    setCreating(true);
    try {
      await signalsService.createSignal({
        aiModel: 'gpt-4o-mini',
        accountBalance: 5000
      });
      // Refresh signals list
      await loadImprovableSignals();
    } catch (error) {
      console.error('Failed to create signal:', error);
    } finally {
      setCreating(false);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Signals</h1>
            <p className="text-neutral-600">
              Create new AI signals or improve existing ones to earn royalties
            </p>
          </div>
        </div>

        {/* Generate Signal Section */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                Generate New Signal
              </h3>
              <p className="text-neutral-600">
                AI will automatically scan 30+ symbols and select the best trading opportunity
              </p>
            </div>
            
            <Button
              variant="primary"
              onClick={createNewSignal}
              disabled={creating}
              className="flex items-center"
            >
              {creating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Signal
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Improvable Signals */}
        {improvableSignals.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900">
                Improvable Signals
              </h2>
              <span className="text-sm text-neutral-500">
                {improvableSignals.length} signals available for improvement
              </span>
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
              No Improvable Signals Available
            </h3>
            <p className="text-neutral-600 mb-6">
              All recent signals have been improved or are too old. 
              Generate a new signal to get started.
            </p>
            
            <Button
              variant="primary"
              onClick={createNewSignal}
              disabled={creating}
              showArrow={true}
            >
              {creating ? 'Generating...' : 'Generate New Signal'}
            </Button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-neutral-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            How Signal Improvement Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
            <div>
              <p className="font-medium text-neutral-900 mb-1">1. Find Signal</p>
              <p>Browse improvable signals less than 24 hours old</p>
            </div>
            <div>
              <p className="font-medium text-neutral-900 mb-1">2. Submit Improvement</p>
              <p>Enhance entry, stop loss, take profit, or analysis</p>
            </div>
            <div>
              <p className="font-medium text-neutral-900 mb-1">3. Earn Royalties</p>
              <p>Get 60% revenue share when traders purchase your improvement</p>
            </div>
          </div>
        </div>
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