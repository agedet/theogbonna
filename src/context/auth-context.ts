import { createContext } from 'react';
import type { UserProfile } from '../services/user';
import type { AppRole } from '../utils/routeConfig';
import type { ILoginResponse } from '../services/auth/types';

export interface AuthContextType {
  user: UserProfile | null;
  role: AppRole | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<ILoginResponse>;
  verifyOtp: (sessionToken: string, otpCode: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  refetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
