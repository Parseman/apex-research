import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import OnboardingPage from './pages/OnboardingPage.tsx';
import HomePage from './pages/HomePage.tsx';
import EquityScreenerPage from './pages/EquityScreenerPage.tsx';
import CryptoScreenerPage from './pages/CryptoScreenerPage.tsx';
import AdminPage from './pages/AdminPage.tsx';

// Utilisateur connecté + onboarding terminé
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (!session.onboardingDone) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

// Utilisateur connecté + admin + onboarding terminé
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (!session.onboardingDone) return <Navigate to="/onboarding" replace />;
  if (session.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

// Utilisateur connecté mais onboarding pas encore fait
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.onboardingDone) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { session, loading } = useAuth();

  if (loading) return (
    <div style={{ background: '#080C10', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid rgba(200,169,110,0.2)', borderTop: '2px solid #C8A96E', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#4A5568', letterSpacing: 3, textTransform: 'uppercase' }}>Berdinvest</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/login"    element={session ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={session ? <Navigate to="/" replace /> : <RegisterPage />} />

      {/* Onboarding — uniquement pour les connectés sans profil complété */}
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

      {/* Pages protégées */}
      <Route path="/"      element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/equity" element={<ProtectedRoute><EquityScreenerPage /></ProtectedRoute>} />
      <Route path="/crypto" element={<ProtectedRoute><CryptoScreenerPage /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
