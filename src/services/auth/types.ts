import type { UserRole } from '../user/types';

export interface IAuthUser {
  id: string;
  userId?: string | null;
  email: string;
  username?: string | null;
  firstName: string | null;
  middleName?: string | null;
  lastName: string | null;
  phoneNumber?: string | null;
  role: UserRole | string;
  isEmailVerified?: boolean;
  permissions?: string[];
  picture?: string | null;
  isGoogleUser?: boolean;
  createdAt?: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ILoginResponse {
  sessionToken?: string;
  message: string;
  requiresTwoFactor?: boolean;
  requiresEmailVerification?: boolean;
  email?: string;
}

export interface IVerifyOtpPayload {
  sessionToken: string;
  otpCode: string;
}

export interface IVerifyOtpResponse {
  user: IAuthUser;
  accessToken?: string;
  refreshToken?: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IForgotPasswordResponse {
  message: string;
}

export interface IResetPasswordPayload {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IResetPasswordResponse {
  message: string;
}

export interface ISetupPasswordPayload {
  invitationToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface IVerifyInvitationResponse {
  valid: boolean;
  user: {
    email: string | null;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}

/** @deprecated Prefer IAuthUser — kept for layout compatibility */
export type IUser = IAuthUser;
