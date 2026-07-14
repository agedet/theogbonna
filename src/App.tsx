import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import LandingPage from './pages/LandingPage'
import CheckoutPage from './pages/CheckoutPage'
import SuccessPage from './pages/SuccessPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import SuperAdminPage from './pages/admin/SuperAdminPage'
import SetupPasswordPage from './pages/admin/SetupPasswordPage'

/** Scrolls to the top of the page whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public */}
        <Route path="/"           element={<LandingPage />}        />
        <Route path="/checkout"   element={<CheckoutPage />}       />
        <Route path="/success"    element={<SuccessPage />}        />

        {/* Admin */}
        <Route path="/admin/login"          element={<AdminLoginPage />}     />
        <Route path="/admin/setup-password" element={<SetupPasswordPage />}  />
        <Route path="/admin"                element={<AdminDashboardPage />} />
        <Route path="/super-admin"          element={<SuperAdminPage />}     />
      </Routes>
    </BrowserRouter>
  )
}

export default App
