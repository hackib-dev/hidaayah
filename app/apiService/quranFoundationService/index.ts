import Axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { qfConfig, qfEnv } from './env';

// ─── Base URLs (derived from QF_ENV) ─────────────────────────────────────────
export const QF_CONTENT_BASE_URL =
  process.env.NEXT_PUBLIC_QF_CONTENT_BASE_URL || `${qfConfig.apiBaseUrl}/content/api/v4`;

export const QF_AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_AUTH_BASE_URL || `${qfConfig.apiBaseUrl}/auth`;

export const QF_SEARCH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_SEARCH_BASE_URL || `${qfConfig.apiBaseUrl}/search`;

export const QF_REFLECT_BASE_URL =
  process.env.NEXT_PUBLIC_QF_REFLECT_BASE_URL || `${qfConfig.apiBaseUrl}/quran-reflect`;

export const QF_OAUTH_BASE_URL = qfConfig.authBaseUrl;

// ─── Per-environment token storage keys ──────────────────────────────────────
// Tokens are namespaced by environment so they are never mixed.
const ENV_KEY = qfEnv; // "production" | "prelive"

const CONTENT_TOKEN_KEY = `qf_content_access_token_${ENV_KEY}`;
const CONTENT_EXPIRES_KEY = `qf_content_token_expires_at_${ENV_KEY}`;
export const USER_TOKEN_KEY = `qf_user_access_token_${ENV_KEY}`;
export const USER_REFRESH_KEY = `qf_user_refresh_token_${ENV_KEY}`;

// ─── Content token helpers ────────────────────────────────────────────────────
export const storeToken = (token: string, expiresIn: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONTENT_TOKEN_KEY, token);
  localStorage.setItem(CONTENT_EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(CONTENT_TOKEN_KEY);
  const expiresAt = localStorage.getItem(CONTENT_EXPIRES_KEY);
  if (!token || !expiresAt) return null;
  if (Date.now() > Number(expiresAt)) {
    localStorage.removeItem(CONTENT_TOKEN_KEY);
    localStorage.removeItem(CONTENT_EXPIRES_KEY);
    return null;
  }
  return token;
};

export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONTENT_TOKEN_KEY);
  localStorage.removeItem(CONTENT_EXPIRES_KEY);
};

export const clearUserTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(USER_REFRESH_KEY);
};

// ─── Content token fetch (client credentials — proxied via /api/auth/token) ──
let inflightTokenFetch: Promise<string> | null = null;

export const ensureContentToken = async (): Promise<string> => {
  const cached = getStoredToken();
  if (cached) return cached;

  if (inflightTokenFetch) return inflightTokenFetch;

  inflightTokenFetch = (async () => {
    const { fetchClientCredentialsToken } = await import('./oauth');
    return fetchClientCredentialsToken();
  })().finally(() => {
    inflightTokenFetch = null;
  });

  return inflightTokenFetch;
};

// ─── Safe diagnostic logger (never logs tokens or secrets) ───────────────────
export function logApiError(context: string, status: number | undefined, hint?: string) {
  // eslint-disable-next-line no-console
  console.error(
    `[QF API][${qfEnv}] ${context} — status: ${status ?? 'unknown'}${hint ? ` — ${hint}` : ''}`
  );
}

// ─── Shared request interceptor factory ──────────────────────────────────────
const addAuthHeaders =
  (fetchToken: boolean) =>
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    if (fetchToken) {
      config.headers['x-client-id'] = qfConfig.contentClientId;
      const token = await ensureContentToken().catch(() => null);
      if (token) config.headers['x-auth-token'] = token;
    } else {
      config.headers['x-client-id'] = qfConfig.clientId;
      const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
      if (token) config.headers['x-auth-token'] = token;
    }
    return config;
  };
// ─── 401 auto-refresh interceptor for user APIs ───────────────────────────────
// Retries once after refreshing the access token. Never loops.
// silent403: when true, 403s are swallowed without logging (reflect API — scopes pending approval)
function addRefreshInterceptor(instance: AxiosInstance, silent403 = false) {
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalReq = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

      if (status === 401 && !originalReq._retried) {
        originalReq._retried = true;
        try {
          const { refreshUserToken } = await import('./oauth');
          const tokenData = await refreshUserToken();
          originalReq.headers['x-auth-token'] = tokenData.access_token;
          return instance(originalReq);
        } catch {
          // Refresh failed — caller must handle re-auth
          logApiError(originalReq.url ?? 'unknown', 401, 'token refresh failed — re-auth required');
          return Promise.reject(error);
        }
      }

      if (status === 403 && !silent403) {
        logApiError(
          originalReq.url ?? 'unknown',
          403,
          'scope not granted — feature should be hidden'
        );
      }

      return Promise.reject(error);
    }
  );
}

// ─── Content API instance ─────────────────────────────────────────────────────
export const contentApi: AxiosInstance = Axios.create({
  baseURL: QF_CONTENT_BASE_URL,
  timeout: 30000
});
contentApi.interceptors.request.use(addAuthHeaders(true));

// ─── Search API instance ──────────────────────────────────────────────────────
export const searchApi: AxiosInstance = Axios.create({
  baseURL: QF_SEARCH_BASE_URL,
  timeout: 30000
});
searchApi.interceptors.request.use(addAuthHeaders(true));

// ─── User API instance (bookmarks, collections, streaks, activity) ────────────
export const userApi: AxiosInstance = Axios.create({
  baseURL: QF_AUTH_BASE_URL,
  timeout: 30000
});
userApi.interceptors.request.use(addAuthHeaders(false));
addRefreshInterceptor(userApi);

// ─── Reflect API instance ─────────────────────────────────────────────────────
export const reflectApi: AxiosInstance = Axios.create({
  baseURL: QF_REFLECT_BASE_URL,
  timeout: 30000
});
reflectApi.interceptors.request.use(addAuthHeaders(false));
// silent403=true: reflect scopes (post/like/save/views) are pending approval on this client
addRefreshInterceptor(reflectApi, true);
