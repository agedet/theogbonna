import { BrowserRouter, Routes, Route, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import VerifyLogin from './pages/auth/VerifyLogin';
import SetupPasswordPage from './pages/auth/SetupPasswordPage';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import AccessDenied from './pages/auth/AccessDenied';
import AdminDashboardPage from './pages/admin/AdminDashboard';
import OrdersPage from './pages/admin/OrdersPage';
import OrderDetailsPage from './pages/admin/OrderDetailsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import PaymentDetailsPage from './pages/admin/PaymentDetailsPage';
import AttendeesPage from './pages/admin/AttendeesPage';
import SuperAdminPage from './pages/super-admin/SuperAdminPage';
import UserManagementPage from './pages/super-admin/UserManagementPage';
import { UserRole } from './services/user/types';
import { DashboardLayout, AdminIndexRedirect } from './components/layout';
import { ProtectedRoute, GuestRoute } from './components/auth';
import { URLS } from './utils/routes';

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

/** Preserve query string when redirecting legacy auth URLs. */
function LegacyRedirect({ to }: { to: string }) {
  const [params] = useSearchParams();
  const qs = params.toString();
  return <Navigate to={qs ? `${to}?${qs}` : to} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path={URLS.HOME} element={<LandingPage />} />
        <Route path={URLS.CHECKOUT} element={<CheckoutPage />} />
        <Route path={URLS.SUCCESS} element={<SuccessPage />} />
        <Route path={URLS.ERROR_PAGE} element={<NotFoundPage />} />
        <Route path={URLS.ACCESS_DENIED} element={<AccessDenied />} />

        {/* Auth — guest only (must stay outside /admin protected layout) */}
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

        {/* Legacy auth paths → current /admin/auth/* routes */}
        <Route path="/admin/login" element={<LegacyRedirect to={URLS.ADMIN_LOGIN} />} />
        <Route path="/admin/verify-otp" element={<LegacyRedirect to={URLS.ADMIN_VERIFY_OTP} />} />
        <Route path="/admin/forgot-password" element={<LegacyRedirect to={URLS.ADMIN_FORGOT_PASSWORD} />} />
        <Route path="/admin/reset-password" element={<LegacyRedirect to={URLS.ADMIN_RESET_PASSWORD} />} />
        <Route path="/admin/setup-password" element={<LegacyRedirect to={URLS.ADMIN_SETUP_PASSWORD} />} />
        <Route path="/admin/verify-email" element={<LegacyRedirect to={URLS.ADMIN_VERIFY_EMAIL} />} />

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
          <Route path="attendees" element={<AttendeesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/:id" element={<PaymentDetailsPage />} />
          <Route path="profile" element={<Placeholder title="Profile" />} />
          <Route path="*" element={<Navigate to={URLS.ERROR_PAGE} replace />} />
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
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="attendees" element={<AttendeesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/:id" element={<PaymentDetailsPage />} />
          <Route path="profile" element={<Placeholder title="Profile" />} />
          <Route path="*" element={<Navigate to={URLS.ERROR_PAGE} replace />} />
        </Route>

        {/* Unknown paths → branded 404 (never Vercel default once rewrite is live) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
