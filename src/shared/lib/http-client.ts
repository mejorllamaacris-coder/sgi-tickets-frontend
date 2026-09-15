// src/shared/lib/http-client.ts

import { BASE_URL } from './url.config';
import { refreshToken, getAccessToken } from './token.service';
import { notify } from './notify';

class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, data: unknown, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const signal = options.signal;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'react',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    signal,
  });

  if (res.status === 401) {
    try {
      const newToken = await refreshToken();
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Type': 'react',
          Authorization: `Bearer ${newToken}`,
          ...options.headers,
        },
        signal,
      });

      if (!retry.ok) throw new ApiError(retry.status, {}, 'Unauthorized');
      return retry.json();
    } catch (err) {
      if (err instanceof ApiError) throw err;
      localStorage.clear();
      window.location.href = '/';
      throw new ApiError(401, {}, 'Session expired');
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { data?: { message?: string } })?.data?.message ?? res.statusText;

    if (res.status >= 500) {
      notify.error('Error del servidor. Intentá de nuevo más tarde.');
    }

    throw new ApiError(res.status, body, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export { ApiError };

export const apiRoute = (module: string) => `/${module}`;

export const httpClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};