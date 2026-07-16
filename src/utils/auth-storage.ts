import { TOKEN } from './token';
import { URLS } from './routes';

export const AUTH_FLASH_KEY = 'ogbonna_auth_flash';
export const PASSWORD_RESET_EMAIL_KEY = 'ogbonna_password_reset_email';
export const VERIFY_PURPOSE_KEY = 'ogbonna_verify_purpose';

export type VerifyPurpose = 'registration' | 'login';

export function storePendingVerificationEmail(email: string) {
  sessionStorage.setItem(TOKEN.EMAIL, email.trim().toLowerCase());
}

export function getPendingVerificationEmail(): string | null {
  return sessionStorage.getItem(TOKEN.EMAIL);
}

export function clearPendingVerificationEmail() {
  sessionStorage.removeItem(TOKEN.EMAIL);
}

export function setVerifyPurpose(purpose: VerifyPurpose) {
  sessionStorage.setItem(VERIFY_PURPOSE_KEY, purpose);
}

export function getVerifyPurpose(): VerifyPurpose | null {
  const value = sessionStorage.getItem(VERIFY_PURPOSE_KEY);
  if (value === 'registration' || value === 'login') {
    return value;
  }
  return null;
}

export function clearVerifyPurpose() {
  sessionStorage.removeItem(VERIFY_PURPOSE_KEY);
}

export function storePasswordResetEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  sessionStorage.setItem(PASSWORD_RESET_EMAIL_KEY, normalized);
}

export function getPasswordResetEmail(): string | null {
  return sessionStorage.getItem(PASSWORD_RESET_EMAIL_KEY);
}

export function clearPasswordResetEmail() {
  sessionStorage.removeItem(PASSWORD_RESET_EMAIL_KEY);
}

export function setAuthFlashMessage(message: string) {
  sessionStorage.setItem(AUTH_FLASH_KEY, message);
}

export function consumeAuthFlashMessage(): string | null {
  const message = sessionStorage.getItem(AUTH_FLASH_KEY);
  if (message) {
    sessionStorage.removeItem(AUTH_FLASH_KEY);
  }
  return message;
}

export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) {
    return 'your email address';
  }

  const visible =
    localPart.length <= 2 ? localPart.slice(0, 1) : localPart.slice(0, 2);

  return `${visible}***@${domain}`;
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response
      ?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    Array.isArray(
      (error as { response?: { data?: { message?: unknown } } }).response?.data
        ?.message,
    )
  ) {
    return (
      (error as { response: { data: { message: string[] } } }).response.data
        .message as string[]
    ).join(', ');
  }

  return fallback;
}

export const AUTH_ROUTES = URLS;
