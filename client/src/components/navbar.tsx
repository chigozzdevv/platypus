import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useAuth } from '@campnetwork/origin/react';

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }: NavbarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, hasHydrated } = useAuthStore();
  const origin = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (typeof (origin as any)?.disconnect === 'function') {
      try {
        await (origin as any).disconnect();
      } catch {}
    }
    logout();
    setIsUserMenuOpen(false);
    navigate('/auth', { replace: true });
  };

  const displayWallet =
    user?.walletAddress || (origin as any)?.walletAddress || null;

  const username =
    user?.username ?? (hasHydrated ? 'Trader' : '—');

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-neutral-200 z-30 h-16">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-neutral-50 transition-colors mr-3"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-neutral-600" /> : <Menu className="w-5 h-5 text-neutral-600" />}
          </button>
          <Link to="/" className="flex items-center">
            <div className="bg-neutral-900 h-8 w-8 rounded flex items-center justify-center text-white font-bold mr-3">P</div>
            <span className="text-xl font-semibold">Platypus</span>
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center p-2 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center mr-3">
              <User className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="text-left mr-2 hidden sm:block">
              <p className="text-sm font-medium text-neutral-900">{username}</p>
              <p className="text-xs text-neutral-500">
                {displayWallet
                  ? `${displayWallet.slice(0, 6)}...${displayWallet.slice(-4)}`
                  : 'Wallet not connected'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-40 min-w-48"
              >
                <Link
                  to="/dashboard/profile"
                  className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 rounded-t-lg"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 border-t border-neutral-100 rounded-b-lg"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Disconnect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}