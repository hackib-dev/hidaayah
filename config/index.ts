export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://startup-api/api';

export const API_AUTH_URL = '/admin/auth';

export const sessionStorageName = 'hidaayah';

export const GUEST_ROUTES = ['/', '/login', '/signup'];

export const DASHBOARD_ROUTE = ['/dashboard'];

export const QF_OAUTH_BASE_URL =
  process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL || 'https://oauth2.quran.foundation';

// Default translation resource ID — Saheeh International (English), ID verified via /resources/translations
export const QF_DEFAULT_TRANSLATION_ID = 20;

// Default Mushaf ID — QCFV2 (standard digital Mushaf)
export const QF_DEFAULT_MUSHAF_ID = 1;

// Default Tafsir resource ID — Tafsir Ibn Kathir (English)
export const QF_DEFAULT_TAFSIR_ID = 169;

// Default reciter ID — Mishary Rashid Alafasy
export const QF_DEFAULT_RECITER_ID = 7;
