import {
  QF_OAUTH_BASE_URL,
  storeToken,
  getStoredToken,
  USER_TOKEN_KEY,
  logApiError
} from './index';

import type { OAuthTokenResponse } from '@/app/apiService/quranFoundationService/types';

const TOKEN_PROXY = '/api/auth/token';

// ─── PKCE helpers ─────────────────────────────────────────────────────────────
function randomString(bytes = 16): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function generatePkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = randomString(32);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return { codeVerifier, codeChallenge };
}

// ─── OAuth error classifier ───────────────────────────────────────────────────
// Returns a user-facing hint without leaking secrets or codes.
function classifyOAuthError(error: string, description?: string): string {
  switch (error) {
    case 'invalid_client':
      return 'OAuth client configuration error. Check client ID, secret, and environment.';
    case 'invalid_grant':
      return 'Authorization code or refresh token is invalid, expired, or already used. Please sign in again.';
    case 'redirect_uri_mismatch':
      return 'Redirect URI does not match the registered value.';
    case 'invalid_scope':
      return `Scope not allowed for this client: ${description ?? ''}`;
    default:
      return description ?? error;
  }
}

// ─── Client Credentials Grant (content/search APIs) ──────────────────────────
export const fetchClientCredentialsToken = async (): Promise<string> => {
  const cached = getStoredToken();
  if (cached) return cached;

  const res = await fetch(TOKEN_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      // scope: 'content search'
      scope: 'content'
    })
  });

  const data: OAuthTokenResponse & { error?: string; error_description?: string } =
    await res.json();

  if (!res.ok || !data.access_token) {
    const hint = classifyOAuthError(data.error ?? 'unknown', data.error_description);
    logApiError('/oauth2/token (client_credentials)', res.status, hint);
    throw new Error(hint);
  }

  storeToken(data.access_token, data.expires_in);
  return data.access_token;
};

// ─── Build the OAuth authorize URL (Authorization Code + PKCE) ───────────────
export const buildAuthorizeUrl = async (redirectUri: string): Promise<string> => {
  const clientId = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
  const scopes = [
    'offline_access',
    'content',
    'user',
    'collection',
    'bookmark',
    'reading_session',
    'preference',
    'comment',
    'post',
    'activity_day',
    'goal',
    'streak',
    'note'
    // 'search'
  ].join(' ');

  const { codeVerifier, codeChallenge } = await generatePkcePair();
  const state = randomString(16);

  // Persist for callback validation — codeVerifier never logged or returned
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

// ─── Authorization Code exchange ──────────────────────────────────────────────
export const exchangeCodeForToken = async (
  code: string,
  redirectUri: string
): Promise<OAuthTokenResponse> => {
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier') || '';

  // Clean up before the request so a partial failure doesn't leave stale keys
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');

  const res = await fetch(TOKEN_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      // code is not logged anywhere — only forwarded to the server proxy
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier
    })
  });

  const data: OAuthTokenResponse & { error?: string; error_description?: string } =
    await res.json();

  if (!res.ok || !data.access_token) {
    const hint = classifyOAuthError(data.error ?? 'unknown', data.error_description);
    logApiError('/oauth2/token (authorization_code)', res.status, hint);
    throw new Error(hint);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_TOKEN_KEY, data.access_token);
    // refresh_token is stored in httpOnly cookie by the proxy — never in localStorage
  }
  return data;
};

// ─── Refresh the access token ─────────────────────────────────────────────────
// The refresh token lives in an httpOnly cookie set by /api/auth/token.
// We send no refresh_token in the body — the proxy reads it from the cookie.
export const refreshUserToken = async (): Promise<OAuthTokenResponse> => {
  const res = await fetch(TOKEN_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin', // ensures the httpOnly cookie is sent
    body: JSON.stringify({ grant_type: 'refresh_token' })
  });

  const data: OAuthTokenResponse & { error?: string; error_description?: string } =
    await res.json();

  if (!res.ok || !data.access_token) {
    const hint = classifyOAuthError(data.error ?? 'unknown', data.error_description);
    logApiError('/oauth2/token (refresh_token)', res.status, hint);
    throw new Error(hint);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_TOKEN_KEY, data.access_token);
    // new refresh_token (if rotated) is set as httpOnly cookie by the proxy
  }
  return data;
};
