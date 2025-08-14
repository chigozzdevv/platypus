import { Link, useLocation } from 'react-router-dom';
import { Home, Radio } from 'lucide-react';

interface AdminNavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function AdminNavigation({ isMobileMenuOpen, setIsMobileMenuOpen }: AdminNavigationProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: Home },
    { path: '/admin/dashboard/signals', label: 'Signals', icon: Radio },
  ];

  return (
    <>
      <div className="hidden md:flex flex-col h-full bg-white border-r border-neutral-200 w-64 fixed left-0 top-16 z-20 bottom-0">
        <nav className="flex-1 p-6 pt-8">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-gray-50 hover:text-neutral-900 hover:shadow-sm'
                }`}
              >
                <div
                  className={`p-2 rounded-lg mr-4 transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div
        className={`md:hidden fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-neutral-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex-1 p-6 pt-8">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item.path}`}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`relative flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                    : 'text-neutral-600 hover:bg-gradient-to-r hover:from-neutral-50 hover:to-gray-50 hover:text-neutral-900 hover:shadow-sm'
                }`}
              >
                <div
                  className={`p-2 rounded-lg mr-4 transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-600'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="flex-1">{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}