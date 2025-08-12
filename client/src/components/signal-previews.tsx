import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SignalCard from './signal-card';
import Button from './button';
import type { Signal } from '@/types/signals';
import { signalsService } from '@/services/signals';
import { useAuthStore } from '@/stores/auth-store';

export default function SignalPreviews() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const loadSignals = async () => {
      try {
        const response = await signalsService.getPublicSignals({ limit: 6 });
        setSignals(response.signals);
      } catch (error) {
        console.error('Failed to load signals:', error);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };

    loadSignals();
  }, []);

  const handleViewMore = () => {
    if (isAuthenticated) {
      navigate('/dashboard/marketplace');
    } else {
      navigate('/auth');
    }
  };

  const handleSignalAction = () => {
    if (isAuthenticated) {
      navigate('/dashboard/marketplace');
    } else {
      navigate('/auth');
    }
  };

  if (loading) {
    return (
      <section id="marketplace" className="py-16 px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Trading Signals</h2>
          <p className="text-lg text-neutral-600">AI-generated strategies enhanced by expert traders</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-neutral-100 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="marketplace" className="py-16 px-4 md:px-8 max-w-screen-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Live Trading Signals</h2>
        <p className="text-lg text-neutral-600">
          AI-generated strategies enhanced by expert traders
        </p>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        {signals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <SignalCard
              signal={signal}
              onView={handleSignalAction}
              onBuy={handleSignalAction}
            />
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={handleViewMore}
          showArrow={true}
        >
          View More Signals
        </Button>
      </motion.div>
    </section>
  );
}