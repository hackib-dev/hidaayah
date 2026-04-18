import { NextRequest, NextResponse } from 'next/server';

// ─── Environment selection ────────────────────────────────────────────────────
const isPrelive =
  process.env.QF_ENV === 'prelive' ||
  (process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL ?? '').includes('prelive');

const QF_ENV = isPrelive ? 'prelive' : 'production';

const AUTH_BASE_URL = isPrelive
  ? 'https://prelive-oauth2.quran.foundation'
  : 'https://oauth2.quran.foundation';

const AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
const AUTH_CLIENT_SECRET = process.env.QF_CLIENT_SECRET || '';

const CONTENT_CLIENT_ID = process.env.QF_CONTENT_CLIENT_ID || '';
const CONTENT_CLIENT_SECRET = process.env.QF_CONTENT_CLIENT_SECRET || '';

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

  const isContentGrant = grant_type === 'client_credentials';
  const isRefreshGrant = grant_type === 'refresh_token';

  const oauthBase = AUTH_BASE_URL;
  const clientId = isContentGrant ? CONTENT_CLIENT_ID : AUTH_CLIENT_ID;
  const clientSecret = isContentGrant ? CONTENT_CLIENT_SECRET : AUTH_CLIENT_SECRET;

  const params = new URLSearchParams({ grant_type, client_id: clientId });

  if (code) params.set('code', code);
  if (redirect_uri) params.set('redirect_uri', redirect_uri);
  if (scope) params.set('scope', scope);
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
