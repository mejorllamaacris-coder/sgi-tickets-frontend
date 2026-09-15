import { useAuthStore } from '@/shared/stores/auth.store';
import { getAccessToken } from '@/shared/lib/token.service';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearSession = useAuthStore((s) => s.clearSession);

  return { session, isAuthenticated, clearSession, token: getAccessToken() };
}