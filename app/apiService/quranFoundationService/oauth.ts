import { QF_OAUTH_BASE_URL, storeToken, getStoredToken, USER_TOKEN_KEY } from './index';
import type { OAuthTokenResponse } from '@/app/apiService/quranFoundationService/types';

// All token requests go through the Next.js API route to avoid CORS
const TOKEN_PROXY = '/api/auth/token';

// ─── Client Credentials Grant (content/search APIs — proxied server-side) ────
export const fetchClientCredentialsToken = async (): Promise<string> => {
  const cached = getStoredToken();
  if (cached) return cached;

  const res = await fetch(TOKEN_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', scope: 'content' })
  });

  const data: OAuthTokenResponse = await res.json();
  if (!data.access_token) throw new Error('Token exchange failed');

  storeToken(data.access_token, data.expires_in);
  return data.access_token;
};

// ─── Build the OAuth authorize URL for user login ─────────────────────────────
// Uses plain Authorization Code flow (no PKCE) with client_secret server-side,
// matching the official QF example app pattern.
export const buildAuthorizeUrl = (redirectUri: string): string => {
  const clientId = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
  const scopes = ['openid', 'offline_access', 'bookmark', 'collection', 'user', 'streak'].join(' ');

  // CSRF state stored in sessionStorage, validated in /callback
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state
  });

  return `${QF_OAUTH_BASE_URL}/oauth2/auth?${params.toString()}`;
};

// ─── Authorization Code exchange (called from /callback — proxied server-side) ─
export const exchangeCodeForToken = async (
  code: string,
  redirectUri: string
): Promise<OAuthTokenResponse> => {
  const res = await fetch(TOKEN_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  });

  sessionStorage.removeItem('oauth_state');

  const data: OAuthTokenResponse = await res.json();
  if (!data.access_token) throw new Error('Token exchange failed');

  // Store user token separately from the client-credentials content token
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_TOKEN_KEY, data.access_token);
  }
  return data;
};
