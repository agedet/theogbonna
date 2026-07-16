import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, LoginForm } from '@/components/auth';
import { useAuthContext } from '@/context/useAuthContext';
import { TOKEN } from '@/utils/token';
import { URLS } from '@/utils/routes';
import { setVerifyPurpose } from '@/utils/auth-storage';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();

  async function handleLogin(email: string, password: string) {
    const res = await login(email, password);

    if (res.requiresEmailVerification || !res.sessionToken) {
      sessionStorage.setItem(TOKEN.EMAIL, email);
      setVerifyPurpose('registration');
      navigate(URLS.ADMIN_VERIFY_EMAIL, {
        state: { email, message: res.message },
        replace: true,
      });
      return;
    }

    sessionStorage.setItem(TOKEN.SESSION_TOKEN, res.sessionToken);
    sessionStorage.setItem(TOKEN.EMAIL, email);
    setVerifyPurpose('login');
    navigate(URLS.ADMIN_VERIFY_OTP, {
      state: { sessionToken: res.sessionToken, email },
      replace: true,
    });
  }

  return (
    <AuthLayout title="Admin Portal" subtitle="Ogbonna Memorial">
      <LoginForm onSubmit={handleLogin} />
      <p className="text-center text-xs text-slate-600">
        Forgot password?{' '}
        <Link to={URLS.FORGOT_PASSWORD} className="text-amber-400 hover:text-amber-300">
          Reset it
        </Link>
      </p>
    </AuthLayout>
  );
}
