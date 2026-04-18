import Axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { qfConfig, qfEnv } from './env';

// ─── Base URLs (derived from QF_ENV) ─────────────────────────────────────────
export const QF_CONTENT_BASE_URL =
  process.env.NEXT_PUBLIC_QF_CONTENT_BASE_URL || `${qfConfig.apiBaseUrl}/content/api/v4`;

export const QF_AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_AUTH_BASE_URL || `${qfConfig.apiBaseUrl}/auth`;

// Search API always uses production — there is no prelive search endpoint
export const QF_SEARCH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_SEARCH_BASE_URL || 'https://apis.quran.foundation/search';

export const QF_REFLECT_BASE_URL =
  process.env.NEXT_PUBLIC_QF_REFLECT_BASE_URL || `${qfConfig.apiBaseUrl}/quran-reflect`;

export const QF_OAUTH_BASE_URL = qfConfig.authBaseUrl;

// ─── Per-environment token storage keys ──────────────────────────────────────
// Tokens are namespaced by environment so they are never mixed.
const ENV_KEY = qfEnv; // "production" | "prelive"

const CONTENT_TOKEN_KEY = `qf_content_access_token_v2_${ENV_KEY}`;
const CONTENT_EXPIRES_KEY = `qf_content_token_expires_at_v2_${ENV_KEY}`;
const REFLECT_TOKEN_KEY = `qf_reflect_access_token_${ENV_KEY}`;
const REFLECT_EXPIRES_KEY = `qf_reflect_token_expires_at_${ENV_KEY}`;
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

// ─── Reflect token helpers (post-scoped client credentials) ──────────────────
const getStoredReflectToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(REFLECT_TOKEN_KEY);
  const expiresAt = localStorage.getItem(REFLECT_EXPIRES_KEY);
  if (!token || !expiresAt) return null;
  if (Date.now() > Number(expiresAt)) {
    localStorage.removeItem(REFLECT_TOKEN_KEY);
    localStorage.removeItem(REFLECT_EXPIRES_KEY);
    return null;
  }
  return token;
};

const storeReflectToken = (token: string, expiresIn: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFLECT_TOKEN_KEY, token);
  localStorage.setItem(REFLECT_EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
};

let inflightReflectFetch: Promise<string> | null = null;

const ensureReflectToken = async (): Promise<string> => {
  const cached = getStoredReflectToken();
  if (cached) return cached;

  if (inflightReflectFetch) return inflightReflectFetch;

  inflightReflectFetch = (async () => {
    const res = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'reflect_credentials' })
    });
    const data = await res.json();
    if (!res.ok || !data.access_token)
      throw new Error(data.error_description ?? 'reflect token failed');
    storeReflectToken(data.access_token, data.expires_in);
    return data.access_token as string;
  })().finally(() => {
    inflightReflectFetch = null;
  });

  return inflightReflectFetch;
};

// ─── Search token helpers (search-scoped client credentials) ─────────────────
const SEARCH_TOKEN_KEY = `qf_search_access_token_${ENV_KEY}`;
const SEARCH_EXPIRES_KEY = `qf_search_token_expires_at_${ENV_KEY}`;

const getStoredSearchToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(SEARCH_TOKEN_KEY);
  const expiresAt = localStorage.getItem(SEARCH_EXPIRES_KEY);
  if (!token || !expiresAt) return null;
  if (Date.now() > Number(expiresAt)) {
    localStorage.removeItem(SEARCH_TOKEN_KEY);
    localStorage.removeItem(SEARCH_EXPIRES_KEY);
    return null;
  }
  return token;
};

const storeSearchToken = (token: string, expiresIn: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SEARCH_TOKEN_KEY, token);
  localStorage.setItem(SEARCH_EXPIRES_KEY, String(Date.now() + expiresIn * 1000));
};

let inflightSearchFetch: Promise<string> | null = null;

const ensureSearchToken = async (): Promise<string> => {
  const cached = getStoredSearchToken();
  if (cached) return cached;

  if (inflightSearchFetch) return inflightSearchFetch;

  inflightSearchFetch = (async () => {
    const res = await fetch('/api/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'search_credentials' })
    });
    const data = await res.json();
    if (!res.ok || !data.access_token)
      throw new Error(data.error_description ?? 'search token failed');
    storeSearchToken(data.access_token, data.expires_in);
    return data.access_token as string;
  })().finally(() => {
    inflightSearchFetch = null;
  });

  return inflightSearchFetch;
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
// silent403: when true, 403s that are real scope errors are swallowed without logging.
//            403s with type=invalid_token (prelive expired token) are always retried.
function addRefreshInterceptor(instance: AxiosInstance, silent403 = false) {
  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalReq = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

      // prelive returns 403 with type "invalid_token" for expired tokens (not a scope error)
      const responseData = error.response?.data as Record<string, unknown> | undefined;
      const isExpiredToken = responseData?.type === 'invalid_token';

      const shouldRefresh =
        (status === 401 || (status === 403 && isExpiredToken)) && !originalReq._retried;

      if (shouldRefresh) {
        originalReq._retried = true;
        try {
          const { refreshUserToken } = await import('./oauth');
          const tokenData = await refreshUserToken();
          originalReq.headers['x-auth-token'] = tokenData.access_token;
          return instance(originalReq);
        } catch {
          logApiError(
            originalReq.url ?? 'unknown',
            status ?? 401,
            'token refresh failed — clearing session'
          );
          // Only redirect to login if user had a valid session (access token existed).
          // Avoids false redirects on first-load API failures before login completes.
          const hadSession =
            typeof window !== 'undefined' && !!localStorage.getItem(USER_TOKEN_KEY);
          clearUserTokens();
          if (hadSession) {
            window.dispatchEvent(new CustomEvent('qf:session-expired'));
          }
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
searchApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.headers['x-client-id'] = process.env.NEXT_PUBLIC_QF_SEARCH_CLIENT_ID || '';
  const token = await ensureSearchToken().catch(() => null);
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

// ─── User API instance (bookmarks, collections, streaks, activity) ────────────
export const userApi: AxiosInstance = Axios.create({
  baseURL: QF_AUTH_BASE_URL,
  timeout: 30000
});
userApi.interceptors.request.use(addAuthHeaders(false));
addRefreshInterceptor(userApi);

// ─── Reflect API instance ─────────────────────────────────────────────────────
// Uses the user token when logged in; falls back to a post-scoped client
// credentials token so unauthenticated feed requests also work.
export const reflectApi: AxiosInstance = Axios.create({
  baseURL: QF_REFLECT_BASE_URL,
  timeout: 30000
});
reflectApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  config.headers['x-client-id'] = qfConfig.clientId;
  const userToken = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
  if (userToken) {
    config.headers['x-auth-token'] = userToken;
  } else {
    const token = await ensureReflectToken().catch(() => null);
    if (token) config.headers['x-auth-token'] = token;
  }
  return config;
});
// silent403=true: swallow 403s that are real scope errors, not token expiry
// isExpiredToken check in the interceptor handles prelive's 403 invalid_token responses
addRefreshInterceptor(reflectApi, true);
