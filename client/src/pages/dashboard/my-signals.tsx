import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, BarChart3 } from 'lucide-react';
import SignalCard from '@/components/signal-card';
import { signalsService } from '@/services/signals';
import type { Signal } from '@/types/signals';

export default function MySignals() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'expired'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'win' | 'loss' | 'pending'>('all');

  useEffect(() => {
    loadUserSignals();
  }, [filterStatus, filterOutcome]);

  const loadUserSignals = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterOutcome !== 'all') params.outcome = filterOutcome;
      
      const response = await signalsService.getUserSignals(params);
      setSignals(response.signals);
    } catch (error) {
      console.error('Failed to load user signals:', error);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  };

  const getSignalStats = () => {
    const total = signals.length;
    const wins = signals.filter(s => s.analysis?.riskAssessment?.includes('win')).length;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    
    return { total, wins, winRate };
  };

  const stats = getSignalStats();

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
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Signals</h1>
          <p className="text-neutral-600">Manage and track your trading signals</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
            <p className="text-sm text-neutral-500">Total Signals</p>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">{stats.winRate.toFixed(1)}%</p>
            </div>
            <p className="text-sm text-neutral-500">Win Rate</p>
          </div>

          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 rounded-lg p-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="mb-1">
              <p className="text-2xl font-bold text-neutral-900">{stats.wins}</p>
            </div>
            <p className="text-sm text-neutral-500">Successful Signals</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={filterOutcome}
                onChange={(e) => setFilterOutcome(e.target.value as any)}
                className="border border-neutral-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
              >
                <option value="all">All Outcomes</option>
                <option value="win">Wins</option>
                <option value="loss">Losses</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Signals Grid */}
        {signals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {signals.map((signal, index) => (
              <motion.div
                key={signal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <SignalCard
                  signal={signal}
                  showExecute={true}
                  onView={() => console.log('View signal:', signal.id)}
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <div className="bg-neutral-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No Signals Found
            </h3>
            <p className="text-neutral-600 mb-6">
              {filterStatus !== 'all' || filterOutcome !== 'all' 
                ? 'No signals match your current filters. Try adjusting your search criteria.'
                : 'You haven\'t created any signals yet. Start generating signals to see them here.'
              }
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}