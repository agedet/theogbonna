import { api } from '@/lib/api';
import type {
  IAuthUser,
  IForgotPasswordPayload,
  IForgotPasswordResponse,
  ILoginResponse,
  IResetPasswordPayload,
  IResetPasswordResponse,
  ISetupPasswordPayload,
  IVerifyInvitationResponse,
  IVerifyOtpResponse,
} from './types';

class AuthService {
  public static login(payload: { email: string; password: string }) {
    return api.post<ILoginResponse>('/auth/login', payload);
  }

  public static verifyOtp(payload: { sessionToken: string; otpCode: string }) {
    return api.post<IVerifyOtpResponse>('/auth/verify-otp', {
      sessionToken: payload.sessionToken.trim(),
      otpCode: payload.otpCode.trim(),
    });
  }

  public static resendOtp(payload: {
    email?: string;
    purpose: 'registration' | 'password_reset' | 'login';
    sessionToken?: string;
  }) {
    return api.post<{ message: string }>('/auth/resend-otp', payload);
  }

  public static getSession() {
    return api.get<IAuthUser>('/auth/me');
  }

  public static logout() {
    return api.post<{ message: string }>('/auth/logout', {}).catch(() => ({
      message: 'Logged out',
    }));
  }

  public static forgotPassword(payload: IForgotPasswordPayload) {
    return api.post<IForgotPasswordResponse>('/auth/forgot-password', payload);
  }

  public static verifyForgotPasswordOtp(payload: { email: string; otpCode: string }) {
    return api.post<{ message: string }>('/auth/verify-forgot-password-otp', payload);
  }

  public static resetPassword(payload: IResetPasswordPayload) {
    return api.post<IResetPasswordResponse>('/auth/reset-password', payload);
  }

  public static setupPassword(payload: ISetupPasswordPayload) {
    return api.post<{ message: string }>('/auth/setup-password', payload);
  }

  public static verifyInvitation(token: string) {
    return api.get<IVerifyInvitationResponse>(
      `/auth/verify-invitation?token=${encodeURIComponent(token)}`,
    );
  }

  public static refreshToken() {
    return api.post<{ user: IAuthUser }>('/auth/refresh', {});
  }
}

export default AuthService;
