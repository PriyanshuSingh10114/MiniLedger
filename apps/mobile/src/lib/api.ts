import { Platform } from 'react-native';
import { tokenStorage } from './storage';

// Default host networking: Android emulator maps host to 10.0.2.2, Web/iOS use localhost
const DEFAULT_API_HOST =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000/api/v1' : 'http://localhost:4000/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_HOST;

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.data?.accessToken) {
      await tokenStorage.setAccessToken(data.data.accessToken);
      if (data.data.refreshToken) {
        await tokenStorage.setRefreshToken(data.data.refreshToken);
      }
      return data.data.accessToken;
    }
    await tokenStorage.clearAll();
    return null;
  } catch {
    await tokenStorage.clearAll();
    return null;
  }
}

/**
 * Universal fetch wrapper with authorization injection and automatic JWT refresh.
 */
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = true, headers: customHeaders, ...restOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let response = await fetch(url, { headers, ...restOptions });

  // Handle 401 Unauthorized with token refresh retry
  if (response.status === 401 && requiresAuth && !endpoint.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;
      if (newToken) {
        onRefreshed(newToken);
      }
    }

    const retryToken = await tokenStorage.getAccessToken();
    if (retryToken) {
      headers['Authorization'] = `Bearer ${retryToken}`;
      response = await fetch(url, { headers, ...restOptions });
    }
  }

  const contentType = response.headers.get('content-type');
  let body: any = null;
  if (contentType && contentType.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  if (!response.ok) {
    const errorMessage = body?.error?.message || response.statusText || 'Request failed';
    const errorCode = body?.error?.code || `HTTP_${response.status}`;
    const errorDetails = body?.error?.details;
    throw new ApiError(errorMessage, errorCode, response.status, errorDetails);
  }

  return (body.data !== undefined ? body.data : body) as T;
}
