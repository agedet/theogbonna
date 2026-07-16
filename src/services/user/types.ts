import type { IBaseDocument } from '../../utils/types';
import type { IUser } from '../auth/types';

/** Matches API / prisma `role` enum */
export const UserRole = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface ISession {
  user: IUser;
  expires: Date;
  accessToken: AccessToken;
}

export interface AccessToken {
  name: string;
  email: string;
  picture: null;
  iat: number;
  exp: number;
  jti: string;
}

export interface IPasswordPayload {
  oldPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface IAccountPayload {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
}

export interface IUserDetails {
  user: IUser;
  wallet: IWallet;
}

export interface IWallet extends IBaseDocument {
  userId: string;
  currency: string;
  balance: number;
  id: number;
  createdAt: Date;
  deletedAt: null;
}

export interface IUpdateProfilePayload {
  fullName: string;
  email: string;
  mobileNumber: string;
}

export interface IUpdatePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}
