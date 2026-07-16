import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/auth';
import { URLS } from '@/utils/routes';

/** Email verification entry — invites use setup-password; this covers residual verify links. */
export default function VerifyEmail() {
  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Use the link from your invitation email to set your password."
      footer={
        <p className="text-center text-xs text-slate-600 mt-4">
          <Link to={URLS.LOGIN} className="text-amber-400 hover:text-amber-300">
            Back to Sign In
          </Link>
        </p>
      }
    >
      <p className="text-sm text-slate-400 text-center">
        If you were invited as an admin, open the invitation link in your email to continue.
      </p>
    </AuthLayout>
  );
}
