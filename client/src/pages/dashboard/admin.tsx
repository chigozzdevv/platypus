import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, X, Eye, Coins, Plus, RefreshCw, Filter, Wallet } from 'lucide-react';
import { useAuth, useAuthState, CampModal } from '@campnetwork/origin/react';
import { adminService } from '@/services/admin';
import { campService, setCampClients } from '@/services/camp';
import type { Signal } from '@/types/signals';
import Button from '@/components/button';
import LoadingSpinner from '@/components/loading-spinner';

interface FilterParams {
  minConfidence?: number;
  maxAge?: number;
  symbol?: string;
  aiModel?: string;
  sortBy?: string;
  limit?: number;
}

export default function AdminDashboard() {
  const [filters, setFilters] = useState<FilterParams>({});
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [generateCount, setGenerateCount] = useState(25);
  const [mintingSignalId, setMintingSignalId] = useState<string | null>(null);
  const [showCampModal, setShowCampModal] = useState(false);
  const queryClient = useQueryClient();
  
  const { jwt, origin, viem } = useAuth();
  const { authenticated } = useAuthState();

  useEffect(() => {
    if (origin && viem) {
      setCampClients({ origin, viem });
      console.log('Camp Network clients initialized', { 
        authenticated, 
        hasOrigin: !!origin,
        hasViem: !!viem,
        hasJWT: !!jwt
      });
    }
  }, [origin, viem, authenticated, jwt]);

  const { data: pendingData, isLoading: loadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['admin-signals-pending', filters],
    queryFn: () => adminService.getSignalsForReview(filters),
  });

  const { data: approvedData, isLoading: loadingApproved, refetch: refetchApproved } = useQuery({
    queryKey: ['admin-signals-approved'],
    queryFn: () => adminService.getApprovedForMinting(),
  });

  const { data: analytics } = useQuery({
    queryKey: ['platform-analytics'],
    queryFn: () => adminService.getPlatformAnalytics(),
  });

  const approveMutation = useMutation({
    mutationFn: ({ signalId, notes }: { signalId: string; notes?: string }) =>
      adminService.approveSignal(signalId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-signals-pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin-signals-approved'] });
      setSelectedSignal(null);
      setAdminNotes('');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ signalId, notes }: { signalId: string; notes: string }) =>
      adminService.rejectSignal(signalId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-signals-pending'] });
      setSelectedSignal(null);
      setAdminNotes('');
    },
  });

  const mintMutation = useMutation({
    mutationFn: (signal: Signal) => {
      setMintingSignalId(signal.id);
      return campService.mintSignalAsParent(signal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-signals-approved'] });
      setSelectedSignal(null);
      setMintingSignalId(null);
    },
    onError: (error) => {
      console.error('Minting failed:', error);
      setMintingSignalId(null);
    },
  });

  const generateMutation = useMutation({
    mutationFn: (count: number) => adminService.generatePlatformSignals(count),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-signals-pending'] });
    },
  });

  const handleApprove = (signalId: string, notes?: string) => {
    approveMutation.mutate({ signalId, notes });
  };

  const handleReject = (signalId: string, notes: string) => {
    if (!notes.trim()) return;
    rejectMutation.mutate({ signalId, notes });
  };

  const handleMint = (signal: Signal) => {
    console.log('Attempting to mint signal:', signal);
    
    if (!authenticated || !origin || !viem) {
      console.error('Camp Network not authenticated!', { 
        authenticated, 
        hasOrigin: !!origin,
        hasViem: !!viem,
        hasJWT: !!jwt
      });
      setShowCampModal(true);
      return;
    }
    
    mintMutation.mutate(signal);
  };

  const handleGenerateSignals = () => {
    generateMutation.mutate(generateCount);
  };

  const pendingSignals = pendingData?.signals || [];
  const approvedSignals = approvedData?.signals || [];
  const isLoading = loadingPending || loadingApproved;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {!authenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Camp Network Required</h3>
                <p className="text-sm text-yellow-700">Connect to Camp Network to mint signals as IP assets</p>
              </div>
            </div>
            <Button onClick={() => setShowCampModal(true)} size="sm" variant="primary">
              Connect Camp Network
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
          <p className="text-neutral-600">Review and manage platform signals</p>
          {authenticated && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Camp Network Connected
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              refetchPending();
              refetchApproved();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500">Total Signals</h3>
            <p className="text-2xl font-bold text-neutral-900">{analytics.totalSignals}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500">Total Users</h3>
            <p className="text-2xl font-bold text-neutral-900">{analytics.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500">Total IP Assets</h3>
            <p className="text-2xl font-bold text-neutral-900">{analytics.totalIPAssets}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500">Revenue</h3>
            <p className="text-2xl font-bold text-neutral-900">${analytics.totalRevenue}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500">Avg Accuracy</h3>
            <p className="text-2xl font-bold text-neutral-900">{analytics.avgSignalAccuracy}%</p>
          </div>
          <div className="md:col-span-2 bg-white p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500">Most Traded</h3>
            <p className="text-lg font-semibold text-neutral-900">{analytics.mostTradedSymbol}</p>
          </div>
          <div className="md:col-span-3 bg-white p-4 rounded-lg border border-neutral-200">
            <h3 className="text-sm font-medium text-neutral-500">Top Performer</h3>
            <p className="text-lg font-semibold text-neutral-900">{analytics.topPerformer}</p>
          </div>
        </div>
      )}

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white p-4 rounded-lg border border-neutral-200 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Min Confidence</label>
              <input
                type="number"
                min="0"
                max="100"
                value={filters.minConfidence ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minConfidence: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="w-full px-3 py-2 border border-neutral-200 rounded-md"
                placeholder="0-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Symbol</label>
              <input
                type="text"
                value={filters.symbol ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, symbol: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md"
                placeholder="e.g., BTCUSDT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">AI Model</label>
              <select
                value={filters.aiModel ?? ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, aiModel: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md"
              >
                <option value="">All Models</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white p-4 rounded-lg border border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">Generate Platform Signals</h3>
            <p className="text-sm text-neutral-600">Create AI-generated signals for the platform</p>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="number"
              min="1"
              max="100"
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value) || 25)}
              className="w-20 px-3 py-2 border border-neutral-200 rounded-md"
            />
            <Button onClick={handleGenerateSignals} disabled={generateMutation.isPending} className="flex items-center">
              {generateMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Generate
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900">Pending Review ({pendingSignals.length})</h2>
            {pendingSignals.map((signal: Signal) => (
              <div key={signal.id} className="bg-white p-4 rounded-lg border border-neutral-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{signal.symbol}</h3>
                    <p className="text-sm text-neutral-600">
                      {signal.side.toUpperCase()} • {signal.confidence}% confidence
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      signal.side === 'long' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {signal.side.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-neutral-500">Entry</p>
                    <p className="font-medium">${signal.entryPrice}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Stop Loss</p>
                    <p className="font-medium">${signal.stopLoss ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Take Profit</p>
                    <p className="font-medium">${signal.takeProfit ?? 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedSignal(signal)} className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleApprove(signal.id)}
                    disabled={approveMutation.isPending}
                    className="flex items-center bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedSignal(signal);
                      setAdminNotes('');
                    }}
                    disabled={rejectMutation.isPending}
                    className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900">Approved for Minting ({approvedSignals.length})</h2>
            {approvedSignals.map((signal: Signal) => (
              <div key={signal.id} className="p-4 rounded-lg border border-green-200 bg-green-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-900">{signal.symbol}</h3>
                    <p className="text-sm text-neutral-600">
                      {signal.side.toUpperCase()} • {signal.confidence}% confidence
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">APPROVED</span>
                </div>

                {signal.adminNotes && (
                  <div className="bg-white p-2 rounded border mb-3">
                    <p className="text-sm text-neutral-600">
                      <strong>Admin Notes:</strong> {signal.adminNotes}
                    </p>
                  </div>
                )}

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleMint(signal)}
                  disabled={mintingSignalId === signal.id || !authenticated}
                  className="flex items-center"
                >
                  {mintingSignalId === signal.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  ) : (
                    <Coins className="w-3 h-3 mr-1" />
                  )}
                  Mint as IP
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showCampModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Connect to Camp Network</h2>
            <p className="text-neutral-600 mb-4">
              You need to authenticate with Camp Network to mint signals as IP assets.
            </p>
            <div className="flex items-center justify-between">
              <Button variant="secondary" onClick={() => setShowCampModal(false)}>
                Cancel
              </Button>
              <div className="ml-4">
                <CampModal injectButton={false} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedSignal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold">Review Signal: {selectedSignal.symbol}</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Direction</p>
                  <p className="font-medium">{selectedSignal.side.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Confidence</p>
                  <p className="font-medium">{selectedSignal.confidence}%</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Entry Price</p>
                  <p className="font-medium">${selectedSignal.entryPrice}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Stop Loss</p>
                  <p className="font-medium">${selectedSignal.stopLoss ?? 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Take Profit</p>
                  <p className="font-medium">${selectedSignal.takeProfit ?? 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-2">Technical Analysis</p>
                <div className="bg-neutral-50 p-3 rounded text-sm">{selectedSignal.analysis.technicalAnalysis}</div>
              </div>

              <div>
                <p className="text-sm text-neutral-500 mb-2">Market Analysis</p>
                <div className="bg-neutral-50 p-3 rounded text-sm">{selectedSignal.analysis.marketAnalysis}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md"
                  rows={3}
                  placeholder="Add notes for approval/rejection..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-neutral-200 flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedSignal(null);
                  setAdminNotes('');
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => handleApprove(selectedSignal.id, adminNotes)}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleReject(selectedSignal.id, adminNotes)}
                disabled={rejectMutation.isPending || !adminNotes.trim()}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}