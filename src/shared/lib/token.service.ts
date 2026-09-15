// src/shared/lib/token.service.ts

import { useAuthStore } from '@/shared/stores/auth.store';
import { BASE_URL } from './url.config';

export function getAccessToken(): string | null {
  // Fuente principal: el session de Zustand (persistido en 'sgi-auth')
  const session = useAuthStore.getState().session;
  if (session?.accessToken) return session.accessToken;
  
  // Fallback legacy (por si algo viejo lo escribe directo)
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  const session = useAuthStore.getState().session;
  if (session?.refreshToken) return session.refreshToken;
  return localStorage.getItem('refresh_token');
}

export async function refreshToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token available');

  const res = await fetch(`${BASE_URL}/gateway/v1/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) throw new Error('Refresh failed');

  const data = (await res.json()) as {
    data: { response: { data: { access_token: string; refresh_token?: string } } };
  };

  const newAccess = data.data.response.data.access_token;
  const newRefresh = data.data.response.data.refresh_token;

  // Actualizar el session en Zustand (fuente de verdad)
  const current = useAuthStore.getState().session;
  if (current) {
    useAuthStore.getState().setSession({
      ...current,
      accessToken: newAccess,
      ...(newRefresh ? { refreshToken: newRefresh } : {}),
    });
  }

  return newAccess;
}