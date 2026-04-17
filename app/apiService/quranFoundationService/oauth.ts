import { QF_OAUTH_BASE_URL, storeToken, getStoredToken, USER_TOKEN_KEY } from './index';
import type { OAuthTokenResponse } from '@/app/apiService/quranFoundationService/types';

// All token requests go through the Next.js API route to avoid CORS
const TOKEN_PROXY = '/api/auth/token';

// ─── PKCE helpers ─────────────────────────────────────────────────────────────
function randomString(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function generatePkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = randomString(32); // 64 hex chars — well within 43–128 char range
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return { codeVerifier, codeChallenge };
}

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

// ─── Build the OAuth authorize URL (Authorization Code + PKCE) ───────────────
// Generates PKCE pair and stores verifier + state + nonce in sessionStorage
// for validation in /callback.
export const buildAuthorizeUrl = async (redirectUri: string): Promise<string> => {
  const clientId = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
  const scopes = ['offline_access', 'bookmark', 'collection', 'user', 'streak'].join(' ');

  const { codeVerifier, codeChallenge } = await generatePkcePair();
  const state = randomString(16);

  // Persist for callback validation
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${QF_OAUTH_BASE_URL}/oauth2/auth?${params.toString()}`;
};

// ─── Authorization Code exchange (called from /callback — proxied server-side) ─
export const exchangeCodeForToken = async (
  code: string,
  redirectUri: string
): Promise<OAuthTokenResponse> => {
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier') || '';

  const res = await fetch(TOKEN_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  });

  // Clean up PKCE + state from session
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');

  const data: OAuthTokenResponse = await res.json();
  if (!data.access_token) throw new Error('Token exchange failed');

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('qf_user_refresh_token', data.refresh_token);
    }
  }
  return data;
};

// ─── Refresh the access token ─────────────────────────────────────────────────
export const refreshUserToken = async (): Promise<OAuthTokenResponse> => {
  const refreshToken =
    typeof window !== 'undefined' ? localStorage.getItem('qf_user_refresh_token') : null;
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await fetch(TOKEN_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  const data: OAuthTokenResponse = await res.json();
  if (!data.access_token) throw new Error('Token refresh failed');

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('qf_user_refresh_token', data.refresh_token);
    }
  }
  return data;
};
