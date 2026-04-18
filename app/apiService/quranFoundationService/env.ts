// ─── Environment config — driven by QF_ENV (server) + NEXT_PUBLIC_ vars (client) ──
// QF_ENV is server-only. Client-side auth URL comes from NEXT_PUBLIC_QF_OAUTH_BASE_URL.
// Both must point to the same environment — never mix prelive auth with production APIs.

export type QfEnv = 'production' | 'prelive';

// Server-side: QF_ENV selects the environment
// Client-side: inferred from NEXT_PUBLIC_QF_OAUTH_BASE_URL
const inferredEnv = (): QfEnv => {
  // Server
  if (process.env.QF_ENV === 'prelive') return 'prelive';
  // Client — infer from the public OAuth base URL
  if (
    typeof process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL === 'string' &&
    process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL.includes('prelive')
  )
    return 'prelive';
  return 'production';
};

export const qfEnv: QfEnv = inferredEnv();

export const qfConfig = {
  authBaseUrl:
    process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL ||
    (qfEnv === 'prelive'
      ? 'https://prelive-oauth2.quran.foundation'
      : 'https://oauth2.quran.foundation'),
  apiBaseUrl:
    qfEnv === 'prelive' ? 'https://apis-prelive.quran.foundation' : 'https://apis.quran.foundation',
  clientId: process.env.NEXT_PUBLIC_QF_CLIENT_ID || '',
  clientSecret: process.env.QF_CLIENT_SECRET || '',
  contentClientId:
    process.env.NEXT_PUBLIC_QF_CONTENT_CLIENT_ID || process.env.QF_CONTENT_CLIENT_ID || '',
  contentClientSecret: process.env.QF_CONTENT_CLIENT_SECRET || ''
};
