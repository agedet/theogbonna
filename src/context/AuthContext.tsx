import React, { useCallback, useEffect, useState } from 'react';
import AuthService from '../services/auth';
import type { UserProfile } from '../services/user';
import type { AppRole } from '../utils/routeConfig';
import { AuthContext, type AuthContextType } from './auth-context';

function normalizeRole(role: string | null | undefined): AppRole | null {
  if (role === 'admin' || role === 'super_admin') return role;
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchUser = useCallback(async () => {
    try {
      const profile = await AuthService.getSession();
      setUser(profile);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    AuthService.getSession()
      .then(profile => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const role = normalizeRole(user?.role ?? null);
  const permissions = user?.permissions ?? [];
  const isAuthenticated = !!user;

  const login = useCallback(async (email: string, password: string) => {
    return AuthService.login({ email, password });
  }, []);

  const verifyOtp = useCallback(async (sessionToken: string, otpCode: string) => {
    const res = await AuthService.verifyOtp({ sessionToken, otpCode });
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (required: string[]) => required.some(p => permissions.includes(p)),
    [permissions],
  );

  const hasAllPermissions = useCallback(
    (required: string[]) => required.every(p => permissions.includes(p)),
    [permissions],
  );

  const value: AuthContextType = {
    user,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    verifyOtp,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
