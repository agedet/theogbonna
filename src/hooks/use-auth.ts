import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface AdminUser {
  id:        string;
  email:     string;
  firstName: string | null;
  lastName:  string | null;
  role:      'admin' | 'super_admin';
}

interface LoginPayload {
  sessionToken: string;
  message:      string;
}

export function useAuth() {
  const [user,    setUser]    = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<AdminUser>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<LoginPayload>('/auth/login', { email, password });
    return res; // caller handles OTP step
  }

  async function verifyOtp(sessionToken: string, otpCode: string) {
    const res = await api.post<{ user: AdminUser }>('/auth/verify-otp', { sessionToken, otpCode });
    setUser(res.user);
    return res.user;
  }

  async function logout() {
    await api.post('/auth/logout', {}).catch(() => {});
    setUser(null);
  }

  return { user, loading, login, verifyOtp, logout };
}
