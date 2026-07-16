/**
 * Compatibility shim — prefer useAuthContext from @/context/useAuthContext
 */
export { useAuthContext as useAuth } from '@/context/useAuthContext';
export type { AuthContextType as UseAuthReturn } from '@/context/auth-context';
