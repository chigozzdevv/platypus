import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useAuth, useAuthState } from '@campnetwork/origin/react';

export default function AuthSync() {
  const { login, isAuthenticated, hasHydrated } = useAuthStore();
  const { jwt, viem } = useAuth();
  const { authenticated: originAuthed } = useAuthState();
  const attemptedRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!originAuthed || !jwt || attemptedRef.current || isAuthenticated) return;
    attemptedRef.current = true;
    handleCampAuth(jwt);
  }, [originAuthed, jwt, isAuthenticated]);

  const handleCampAuth = async (campJWT: string) => {
    try {
      const accounts = await viem?.request({ method: 'eth_accounts' });
      const walletAddress = accounts?.[0];
      if (!walletAddress) {
        attemptedRef.current = false;
        return;
      }
      const { isAdmin } = await login(walletAddress, campJWT);
      if (location.pathname === '/auth' || location.pathname === '/') {
        navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
      }
    } catch {
      attemptedRef.current = false;
    }
  };

  useEffect(() => {
    if (!hasHydrated) return;
  }, [hasHydrated]);

  return null;
}