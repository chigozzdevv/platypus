import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { campService } from '@/services/camp';
import type { Signal } from '@/types/signals';

export const useSignalAccess = (signal: Signal | null) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuthStore();

  useEffect(() => {
    const checkAccess = async () => {
      if (!signal) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {

        if (!signal.registeredAsIP || !signal.ipTokenId) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        if (isAdmin) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        if (user && signal.creator.id === user.id) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        const access = await campService.checkSignalAccess(signal);
        setHasAccess(access);
      } catch (error) {
        console.error('Access check failed:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [signal, user, isAdmin]);

  const purchaseAccess = async () => {
    if (!signal?.ipTokenId) return;

    try {
      await campService.purchaseAccess(signal.ipTokenId);
      setHasAccess(true);
    } catch (error) {
      console.error('Purchase failed:', error);
      throw error;
    }
  };

  return { hasAccess, loading, purchaseAccess };
};