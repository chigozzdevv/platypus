import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { CampModal, useAuth, useAuthState } from '@campnetwork/origin/react';

export default function AuthModal() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const { jwt, viem } = useAuth();
  const { authenticated } = useAuthState();

  useEffect(() => {
    if (authenticated && jwt) {
      handleCampAuth();
    }
  }, [authenticated, jwt]);

  const handleCampAuth = async () => {
    try {
      const accounts = await viem.request({ method: 'eth_accounts' });
      const walletAddress = accounts[0];
      
      if (!walletAddress) {
        console.error('No wallet address found');
        return;
      }

      await login(walletAddress, jwt || undefined);
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Camp auth error:', err);
    }
  };

  return <CampModal />;
}