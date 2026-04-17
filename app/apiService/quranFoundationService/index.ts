import Axios, { AxiosInstance } from 'axios';

// ─── Base URLs ─────────────────────────────────────────────────────────────────
export const QF_CONTENT_BASE_URL =
  process.env.NEXT_PUBLIC_QF_CONTENT_BASE_URL || 'https://apis.quran.foundation/content/api/v4';

export const QF_AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_AUTH_BASE_URL || 'https://apis.quran.foundation/auth';

export const QF_SEARCH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_SEARCH_BASE_URL || 'https://apis.quran.foundation/search';

export const QF_OAUTH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL || 'https://oauth2.quran.foundation';

// ─── Token storage helpers ──────────────────────────────────────────────────────
// "content" keys store the client-credentials token for content/search APIs.
// "user" keys store the logged-in user's access token for user/auth APIs.
const CONTENT_TOKEN_KEY = 'qf_content_access_token';
const CONTENT_EXPIRES_KEY = 'qf_content_token_expires_at';
export const USER_TOKEN_KEY = 'qf_user_access_token';

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

// ─── Token fetch (client credentials — proxied via /api/auth/token) ─────────
let inflightTokenFetch: Promise<string> | null = null;

export const ensureContentToken = async (): Promise<string> => {
  const cached = getStoredToken();
  if (cached) return cached;

  if (inflightTokenFetch) return inflightTokenFetch;

  inflightTokenFetch = (async () => {
    // Import lazily to avoid circular deps
    const { fetchClientCredentialsToken } = await import('./oauth');
    return fetchClientCredentialsToken();
  })().finally(() => {
    inflightTokenFetch = null;
  });

  return inflightTokenFetch;
};

// ─── Shared request interceptor factory ────────────────────────────────────────
// Adds x-client-id on every request. For content/search APIs, also fetches
// and attaches a client-credentials token if none is in localStorage.
// Content APIs use the production client ID; user APIs use the auth client ID
const CONTENT_CLIENT_ID = '35b5c830-4a8d-4e57-9588-946d695080a4';

const addAuthHeaders =
  (fetchToken: boolean) =>
  async (config: any): Promise<any> => {
    if (fetchToken) {
      // Content / Search — production client credentials token
      config.headers['x-client-id'] = CONTENT_CLIENT_ID;
      const token = await ensureContentToken().catch(() => null);
      if (token) config.headers['x-auth-token'] = token;
    } else {
      // User API — pre-live auth client + user's login token
      config.headers['x-client-id'] = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
      const token = typeof window !== 'undefined' ? localStorage.getItem(USER_TOKEN_KEY) : null;
      if (token) config.headers['x-auth-token'] = token;
    }

    return config;
  };

// ─── Content API instance (chapters, verses, audio, translations, tafsir) ──────
export const contentApi: AxiosInstance = Axios.create({
  baseURL: QF_CONTENT_BASE_URL,
  timeout: 30000
});
contentApi.interceptors.request.use(addAuthHeaders(true));

// ─── Search API instance ────────────────────────────────────────────────────────
export const searchApi: AxiosInstance = Axios.create({
  baseURL: QF_SEARCH_BASE_URL,
  timeout: 30000
});
searchApi.interceptors.request.use(addAuthHeaders(true));

// ─── User API instance (bookmarks, collections, streaks, activity) ──────────────
export const userApi: AxiosInstance = Axios.create({
  baseURL: QF_AUTH_BASE_URL,
  timeout: 30000
});
userApi.interceptors.request.use(addAuthHeaders(false));

// ─── Reflect API instance (user profile, posts, notes) ──────────────────────────
export const QF_REFLECT_BASE_URL =
  process.env.NEXT_PUBLIC_QF_REFLECT_BASE_URL ||
  'https://apis-prelive.quran.foundation/quran-reflect';

export const reflectApi: AxiosInstance = Axios.create({
  baseURL: QF_REFLECT_BASE_URL,
  timeout: 30000
});
reflectApi.interceptors.request.use(addAuthHeaders(false));
