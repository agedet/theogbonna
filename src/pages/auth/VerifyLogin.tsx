import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout, VerifyOtpForm } from '@/components/auth';
import { useAuthContext } from '@/context/useAuthContext';
import AuthService from '@/services/auth';
import { clearVerifyPurpose } from '@/utils/auth-storage';
import { getDashboardByRole } from '@/utils/routeConfig';
import { TOKEN } from '@/utils/token';
import { URLS } from '@/utils/routes';
import type { AppRole } from '@/utils/routeConfig';

interface OtpLocationState {
  sessionToken?: string;
  email?: string;
}

export default function VerifyLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { verifyOtp } = useAuthContext();

  const state = (location.state ?? {}) as OtpLocationState;
  const sessionToken =
    state.sessionToken ||
    sessionStorage.getItem(TOKEN.SESSION_TOKEN) ||
    searchParams.get('sessionToken') ||
    '';
  const email =
    state.email ||
    sessionStorage.getItem(TOKEN.EMAIL) ||
    searchParams.get('email') ||
    '';

  const hasValidSessionToken =
    !!sessionToken &&
    sessionToken !== 'undefined' &&
    sessionToken !== 'null' &&
    sessionToken.split('.').length === 3;

  useEffect(() => {
    if (!hasValidSessionToken) {
      sessionStorage.removeItem(TOKEN.SESSION_TOKEN);
      navigate(URLS.ADMIN_LOGIN, { replace: true });
    }
  }, [hasValidSessionToken, navigate]);

  if (!hasValidSessionToken) return null;

  async function handleVerify(otp: string) {
    const user = await verifyOtp(sessionToken, otp);
    sessionStorage.removeItem(TOKEN.SESSION_TOKEN);
    clearVerifyPurpose();

    const redirectUrl = searchParams.get('redirectUrl');
    if (redirectUrl?.startsWith('/')) {
      navigate(redirectUrl, { replace: true });
      return;
    }

    navigate(getDashboardByRole(user.role as AppRole), { replace: true });
  }

  async function handleResend() {
    await AuthService.resendOtp({ purpose: 'login', sessionToken });
  }

  return (
    <AuthLayout title="Verify Login" subtitle="Enter the code we emailed you">
      <VerifyOtpForm
        email={email || 'your email'}
        onSubmit={handleVerify}
        onBack={() => navigate(URLS.ADMIN_LOGIN, { replace: true })}
      />
      <button
        type="button"
        onClick={() => void handleResend()}
        className="w-full text-center text-xs text-slate-600 hover:text-slate-400 transition-colors"
      >
        Resend code
      </button>
    </AuthLayout>
  );
}
