import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampProvider } from '@campnetwork/origin/react';
import { useAuthStore } from './stores/auth-store';
import ErrorBoundary from './components/error-boundary';
import Landing from './pages/landing';
import Auth from './pages/auth';
import DashboardLayout from './components/dashboard-layout';
import Overview from './pages/dashboard/overview';
import Marketplace from './pages/dashboard/marketplace';
import Signals from './pages/dashboard/signals';
import Trades from './pages/dashboard/trades';
import Royalties from './pages/dashboard/royalties';
import MySignals from './pages/dashboard/my-signals';
import Profile from './pages/dashboard/profile';
import Settings from './pages/dashboard/settings';

const queryClient = new QueryClient();

function App() {
  const { isAuthenticated, token, loadUser } = useAuthStore();

  useEffect(() => {
    if (token && !isAuthenticated) {
      loadUser();
    }
  }, [token, isAuthenticated, loadUser]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <CampProvider clientId={import.meta.env.VITE_CAMP_CLIENT_ID}>
          <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/auth" 
              element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} 
            />
            
            <Route 
              path="/dashboard/*" 
              element={
                isAuthenticated ? (
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Overview />} />
                      <Route path="/overview" element={<Overview />} />
                      <Route path="/marketplace" element={<Marketplace />} />
                      <Route path="/signals" element={<Signals />} />
                      <Route path="/trades" element={<Trades />} />
                      <Route path="/royalties" element={<Royalties />} />
                      <Route path="/my-signals" element={<MySignals />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </DashboardLayout>
                ) : (
                  <Navigate to="/auth" replace />
                )
              } 
            />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CampProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;