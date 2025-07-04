import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useProfile } from './hooks/useProfile';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { BottomNavigation } from './components/ui/BottomNavigation';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';
import { BackToTop } from './components/ui/BackToTop';

// Pages
import { SplashScreen } from './pages/SplashScreen';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { Dashboard } from './pages/Dashboard';
import { MealPlanningDashboard } from './pages/MealPlanningDashboard';
import { RecipesPage } from './pages/RecipesPage';
import { GroceryPage } from './pages/GroceryPage';
import { SettingsPage } from './pages/SettingsPage';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#331442' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (user && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#331442' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is authenticated and has completed onboarding, redirect to dashboard
  if (user && profile?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (user && profile && !profile.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

function App() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Set viewport height for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <Router>
      <div className="App min-h-screen relative">
        <Routes>
          {/* Splash Screen */}
          <Route path="/" element={<SplashScreen />} />
          
          {/* Public Routes */}
          <Route path="/auth/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/auth/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/auth/reset-password" element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } />
          
          {/* Onboarding Route - Special case: accessible when authenticated but not onboarded */}
          <Route path="/onboarding" element={
            <OnboardingFlow />
          } />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <Dashboard />
                <BottomNavigation />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/meal-planning" element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <MealPlanningDashboard />
                <BottomNavigation />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/recipes" element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <RecipesPage />
                <BottomNavigation />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/grocery" element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <GroceryPage />
                <BottomNavigation />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="pb-16 md:pb-0">
                <SettingsPage />
                <BottomNavigation />
              </div>
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* PWA Components */}
        <PWAInstallPrompt />
        <BackToTop />
      </div>
    </Router>
  );
}

export default App;