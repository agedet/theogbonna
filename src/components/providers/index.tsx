import React from 'react';
import { ToastProvider } from './toast-provider';
import { AuthProvider } from '../../context/AuthContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
};
