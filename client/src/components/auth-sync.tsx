import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useAuth, useAuthState } from '@campnetwork/origin/react';

export default function AuthSync() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAdmin } = useAuthStore();
  const { jwt, viem } = useAuth();
  const { authenticated } = useAuthState();
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!authenticated || !jwt || isAuthenticated || attemptedRef.current) return;
    attemptedRef.current = true;
    (async () => {
      try {
        const accounts = await viem.request({ method: 'eth_accounts' });
        const walletAddress = accounts?.[0];
        if (!walletAddress) {
          attemptedRef.current = false;
          return;
        }
        const { isAdmin: admin } = await login(walletAddress, jwt);
        navigate(admin ? '/admin/dashboard' : '/dashboard', { replace: true });
      } catch {
        attemptedRef.current = false;
      }
    })();
  }, [authenticated, jwt, isAuthenticated, login, navigate, viem]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (location.pathname === '/' || location.pathname === '/auth') {
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate]);

  return null;
}
