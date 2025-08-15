import { useEffect, useRef } from 'react';
import { useAuth, useAuthState } from '@campnetwork/origin/react';
import { useAuthStore } from '@/stores/auth-store';
import { campService } from '@/services/camp';
import { useNavigate, useLocation } from 'react-router-dom';

function parseWallet(jwt: string): string | null {
  try {
    const p = JSON.parse(atob((jwt.split('.')[1] || '').replace(/-/g, '+').replace(/_/g, '/')));
    const w = String(p.walletAddress || p.wallet || p.sub || '').toLowerCase();
    return w || null;
  } catch {
    return null;
  }
}

export default function AuthSync() {
  const auth = useAuth();
  const { authenticated } = useAuthState();
  const { isAuthenticated, token, login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const lock = useRef(false);

  useEffect(() => {
    const setup = async () => {
      const viem = (auth as any)?.viem;
      const origin = (auth as any)?.origin ?? null;
      (window as any).__campAuth = auth;
      if (viem) campService.setClients({ viem });
      try {
        const jwt = origin ? await origin.getJwt() : localStorage.getItem('camp_jwt');
        if (jwt) {
          campService.setJwt(jwt);
          localStorage.setItem('camp_jwt', jwt);
          const w = parseWallet(jwt);
          if (w) campService.setWalletAddress(w as `0x${string}`);
        }
      } catch {}
    };
    setup();
  }, [auth]);

  useEffect(() => {
    const run = async () => {
      if (!authenticated) return;
      if (lock.current) return;
      if (isAuthenticated && token) return;
      lock.current = true;
      try {
        const origin = (auth as any)?.origin ?? null;
        const jwt = origin ? await origin.getJwt() : localStorage.getItem('camp_jwt');
        if (!jwt) return;
        const wallet = parseWallet(jwt);
        if (!wallet) return;
        campService.setJwt(jwt);
        campService.setWalletAddress(wallet as `0x${string}`);
        const { isAdmin } = await login(wallet, jwt);
        if (location.pathname === '/auth' || location.pathname === '/') {
          navigate(isAdmin ? '/admin/dashboard' : '/dashboard', { replace: true });
        }
      } finally {
        lock.current = false;
      }
    };
    run();
  }, [authenticated, auth, isAuthenticated, token, login, navigate, location]);

  return null;
}
