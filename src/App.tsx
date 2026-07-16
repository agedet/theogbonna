import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/auth/LoginPage';
import VerifyLogin from './pages/auth/VerifyLogin';
import SetupPasswordPage from './pages/auth/SetupPasswordPage';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import AdminDashboardPage from './pages/admin/AdminDashboard';
import SuperAdminPage from './pages/super-admin/SuperAdminPage';
import { UserRole } from './services/user/types';
import { DashboardLayout, AdminIndexRedirect } from './components/layout';
import { ProtectedRoute, GuestRoute } from './components/auth';
import { URLS } from './utils/routes';
import ForgotPassword from './pages/auth/ForgotPassword';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="text-slate-500 text-sm mt-1">Coming soon.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public — not protected */}
        <Route path={URLS.HOME} element={<LandingPage />} />
        <Route path={URLS.CHECKOUT} element={<CheckoutPage />} />
        <Route path={URLS.SUCCESS} element={<SuccessPage />} />

        {/* Auth — guest only */}
        <Route
          path={URLS.ADMIN_LOGIN}
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path={URLS.ADMIN_VERIFY_OTP}
          element={
            <GuestRoute>
              <VerifyLogin />
            </GuestRoute>
          }
        />
        <Route
          path={URLS.ADMIN_FORGOT_PASSWORD}
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />
        <Route
          path={URLS.ADMIN_RESET_PASSWORD}
          element={
            <GuestRoute>
              <ResetPassword />
            </GuestRoute>
          }
        />
        <Route
          path={URLS.ADMIN_SETUP_PASSWORD}
          element={
            <GuestRoute>
              <SetupPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path={URLS.ADMIN_VERIFY_EMAIL}
          element={
            <GuestRoute>
              <VerifyEmail />
            </GuestRoute>
          }
        />

        {/* Admin dashboard — admin + super_admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminIndexRedirect />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="attendees" element={<Placeholder title="Attendees" />} />
          <Route path="orders" element={<Placeholder title="Orders" />} />
          <Route path="fulfilment" element={<Placeholder title="Fulfilment" />} />
          <Route path="payments" element={<Placeholder title="Payments" />} />
          <Route path="profile" element={<Placeholder title="Profile" />} />
        </Route>

        {/* Super admin dashboard */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={URLS.SUPER_ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<SuperAdminPage />} />
          <Route path="user-management" element={<Placeholder title="User Management" />} />
          <Route path="attendees" element={<Placeholder title="Attendees" />} />
          <Route path="orders" element={<Placeholder title="Orders" />} />
          <Route path="payments" element={<Placeholder title="Payments" />} />
          <Route path="profile" element={<Placeholder title="Profile" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
