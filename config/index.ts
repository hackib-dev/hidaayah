export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://startup-api/api';

export const API_BASE_URL_PROXY = process.env.NEXT_PUBLIC_API_PATH || 'http://localhost:8000/api';

export const PORT = process.env.NEXT_PUBLIC_PORT || 8000;

export const API_PATH = process.env.NEXT_PUBLIC_API_PATH || 'api';

export const API_USER_URL = '/v1';

export const API_AUTH_URL = '/admin/auth';

export const DEFAULT_COUNTRY_PREFIX = '+234';

export const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd';

export const DEFAULT_CURRENCY = 'NGN';

export const sessionStorageName = 'starter-pack';

export const defaultTTL = 900000;

export const GUEST_ROUTES = ['/', '/login', '/signup'];

export const DASHBOARD_ROUTE = ['/dashboard'];

// ─── Quran Foundation API ────────────────────────────────────────────────────
export const QF_CONTENT_BASE_URL =
  process.env.NEXT_PUBLIC_QF_CONTENT_BASE_URL || 'https://apis.quran.foundation/content/api/v4';

export const QF_AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_AUTH_BASE_URL || 'https://apis.quran.foundation/auth';

export const QF_SEARCH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_SEARCH_BASE_URL || 'https://apis.quran.foundation/search';

export const QF_OAUTH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL || 'https://oauth2.quran.foundation';

export const QF_CLIENT_ID = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';

// Default translation resource ID — Saheeh International (English), ID verified via /resources/translations
export const QF_DEFAULT_TRANSLATION_ID = 20;

// Default Mushaf ID — QCFV2 (standard digital Mushaf)
export const QF_DEFAULT_MUSHAF_ID = 1;

// Default Tafsir resource ID — Tafsir Ibn Kathir (English)
export const QF_DEFAULT_TAFSIR_ID = 169;

// Default reciter ID — Mishary Rashid Alafasy
export const QF_DEFAULT_RECITER_ID = 7;

export const QF_OAUTH_REDIRECT_URI =
  process.env.NEXT_PUBLIC_QF_OAUTH_REDIRECT_URI || 'https://hidaayah-3wey.vercel.app/callback';

export const QF_TOKEN_STORAGE_KEY = 'qf_access_token';
export const QF_TOKEN_EXPIRES_KEY = 'qf_token_expires_at';
