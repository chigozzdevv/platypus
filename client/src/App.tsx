import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampProvider } from '@campnetwork/origin/react';
import AuthSync from './components/auth-sync';
import Landing from './pages/landing';
import Auth from './pages/auth';
import DashboardLayout from './components/dashboard-layout';
import AdminLayout from './components/admin-layout';
import Overview from './pages/dashboard/overview';
import Marketplace from './pages/dashboard/marketplace';
import Signals from './pages/dashboard/signals';
import Trades from './pages/dashboard/trades';
import Royalties from './pages/dashboard/royalties';
import MySignals from './pages/dashboard/my-signals';
import Profile from './pages/dashboard/profile';
import Settings from './pages/dashboard/settings';
import AdminDashboard from './pages/dashboard/admin';
import { useAuthStore } from './stores/auth-store';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, isAdmin, token, user, loadUser } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      loadUser();
    }
  }, [token, user, loadUser]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/auth"
        element={
          isAuthenticated
            ? <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />
            : <Auth />
        }
      />
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="overview" element={<Overview />} />
                <Route path="marketplace" element={<Marketplace />} />
                <Route path="signals" element={<Signals />} />
                <Route path="trades" element={<Trades />} />
                <Route path="royalties" element={<Royalties />} />
                <Route path="my-signals" element={<MySignals />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          ) : <Navigate to="/auth" replace />
        }
      />
      <Route
        path="/admin/dashboard/*"
        element={
          isAuthenticated && isAdmin ? (
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="signals" element={<AdminDashboard />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </AdminLayout>
          ) : isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CampProvider
        clientId={import.meta.env.VITE_PUBLIC_ORIGIN_CLIENT_ID}
        redirectUri={window.location.origin}
      >
        <Router>
          <AuthSync />
          <AppRoutes />
        </Router>
      </CampProvider>
    </QueryClientProvider>
  );
}
