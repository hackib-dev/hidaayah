import { NextRequest, NextResponse } from 'next/server';

// ─── Environment selection ────────────────────────────────────────────────────
const isPrelive =
  process.env.QF_ENV === 'prelive' ||
  (process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL ?? '').includes('prelive');

const QF_ENV = isPrelive ? 'prelive' : 'production';

// User auth client uses prelive or production OAuth depending on QF_ENV
const USER_OAUTH_BASE = isPrelive
  ? 'https://prelive-oauth2.quran.foundation'
  : 'https://oauth2.quran.foundation';

// Content client always uses production OAuth (35b5c830 only exists there)
const CONTENT_OAUTH_BASE = 'https://oauth2.quran.foundation';

const AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
const AUTH_CLIENT_SECRET = process.env.QF_CLIENT_SECRET || '';

const CONTENT_CLIENT_ID = process.env.QF_CONTENT_CLIENT_ID || '';
const CONTENT_CLIENT_SECRET = process.env.QF_CONTENT_CLIENT_SECRET || '';

const SEARCH_CLIENT_ID = process.env.QF_SEARCH_CLIENT_ID || '';
const SEARCH_CLIENT_SECRET = process.env.QF_SEARCH_CLIENT_SECRET || '';

const REFRESH_COOKIE = `qf_refresh_${QF_ENV}`;
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 60 * 60 * 24 * 30 // 30 days
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { grant_type, code, redirect_uri, scope, code_verifier } = body;

  // Virtual grant types — all map to client_credentials with a fixed scope + dedicated client
  const isReflectGrant = grant_type === 'reflect_credentials';
  const isSearchGrant = grant_type === 'search_credentials';
  const isContentGrant = grant_type === 'client_credentials';
  const isRefreshGrant = grant_type === 'refresh_token';

  const resolvedGrantType = isReflectGrant || isSearchGrant ? 'client_credentials' : grant_type;

  // Search client lives on prelive OAuth (that's where it was registered)
  const SEARCH_OAUTH_BASE = 'https://prelive-oauth2.quran.foundation';

  const oauthBase = isContentGrant
    ? CONTENT_OAUTH_BASE
    : isSearchGrant
      ? SEARCH_OAUTH_BASE
      : USER_OAUTH_BASE;

  const clientId = isContentGrant
    ? CONTENT_CLIENT_ID
    : isSearchGrant
      ? SEARCH_CLIENT_ID
      : AUTH_CLIENT_ID;

  const clientSecret = isContentGrant
    ? CONTENT_CLIENT_SECRET
    : isSearchGrant
      ? SEARCH_CLIENT_SECRET
      : AUTH_CLIENT_SECRET;

  const resolvedScope = isReflectGrant ? 'post user' : isSearchGrant ? 'search' : (scope ?? ''); // prettier-ignore

  // Confidential clients: client_id goes in Authorization: Basic header only — NOT in the body.
  // Sending client_id in the body alongside Basic auth causes Hydra to return invalid_client.
  const params = new URLSearchParams({ grant_type: resolvedGrantType });

  if (code) params.set('code', code);
  if (redirect_uri) params.set('redirect_uri', redirect_uri);
  if (resolvedScope) params.set('scope', resolvedScope);
  if (code_verifier) params.set('code_verifier', code_verifier);

  // For refresh grants, read token from httpOnly cookie — never from request body
  if (isRefreshGrant) {
    const cookieToken = req.cookies.get(REFRESH_COOKIE)?.value;
    if (!cookieToken) {
      return NextResponse.json(
        { error: 'no_refresh_token', error_description: 'No refresh token cookie found.' },
        { status: 401 }
      );
    }
    params.set('refresh_token', cookieToken);
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const upstream = await fetch(`${oauthBase}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`
    },
    body: params.toString()
  });

  const data: Record<string, unknown> = await upstream.json();

  if (!upstream.ok) {
    // eslint-disable-next-line no-console
    console.error(
      `[QF token][${QF_ENV}] /oauth2/token — grant: ${grant_type} — status: ${upstream.status} — error: ${data.error ?? 'unknown'}`
    );
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json(
    // Strip refresh_token from response body — browser never sees it
    { ...data, refresh_token: undefined },
    { status: upstream.status }
  );

  // Store refresh token in httpOnly cookie if present
  if (
    typeof data.refresh_token === 'string' &&
    (grant_type === 'authorization_code' || isRefreshGrant)
  ) {
    response.cookies.set(REFRESH_COOKIE, data.refresh_token, COOKIE_OPTS);
  }

  return response;
}
