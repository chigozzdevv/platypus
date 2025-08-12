import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  ShoppingCart, 
  Zap, 
  Coins, 
  User, 
  ChevronDown,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function Navigation() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: BarChart3 },
    { path: '/dashboard/marketplace', label: 'Marketplace', icon: ShoppingCart },
    { path: '/dashboard/signals', label: 'Signals', icon: Zap },
    { path: '/dashboard/royalties', label: 'Royalties', icon: Coins },
    { path: '/dashboard/my-signals', label: 'My Signals', icon: User },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white border-r border-neutral-200 w-64 fixed left-0 top-0 z-20">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="bg-neutral-900 h-8 w-8 rounded flex items-center justify-center text-white font-bold mr-2">
            P
          </div>
          <span className="text-xl font-semibold">Platypus</span>
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-neutral-200">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-md hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center mr-3">
                <User className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-900">
                  {user?.username || 'Trader'}
                </p>
                <p className="text-xs text-neutral-500">
                  {user?.walletAddress ? 
                    `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 
                    'Wallet connected'
                  }
                </p>
              </div>
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
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-10"
              >
                <Link
                  to="/dashboard/profile"
                  className="flex items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border-t border-neutral-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors group ${
                isActive(item.path)
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
              {/* Underline on hover */}
              <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-neutral-900 transform transition-transform duration-200 ${
                isActive(item.path) 
                  ? 'scale-x-100' 
                  : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}