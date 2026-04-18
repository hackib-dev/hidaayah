import { NextRequest, NextResponse } from 'next/server';

// ─── Environment selection ────────────────────────────────────────────────────
// Prefer explicit QF_ENV; fall back to inferring from the public OAuth base URL.
const isPrelive =
  process.env.QF_ENV === 'prelive' ||
  (process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL ?? '').includes('prelive');

const QF_ENV = isPrelive ? 'prelive' : 'production';

const AUTH_BASE_URL = isPrelive
  ? 'https://prelive-oauth2.quran.foundation'
  : 'https://oauth2.quran.foundation';

// User auth client — authorization_code + refresh_token grants
const AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
const AUTH_CLIENT_SECRET = process.env.QF_CLIENT_SECRET || '';

// Content client — client_credentials grant only
const CONTENT_CLIENT_ID = process.env.QF_CONTENT_CLIENT_ID || '';
const CONTENT_CLIENT_SECRET = process.env.QF_CONTENT_CLIENT_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { grant_type, code, redirect_uri, refresh_token, scope, code_verifier } = body;

  const isContentGrant = grant_type === 'client_credentials';

  const oauthBase = AUTH_BASE_URL;
  const clientId = isContentGrant ? CONTENT_CLIENT_ID : AUTH_CLIENT_ID;
  const clientSecret = isContentGrant ? CONTENT_CLIENT_SECRET : AUTH_CLIENT_SECRET;

  const params = new URLSearchParams({ grant_type, client_id: clientId });

  if (code) params.set('code', code);
  if (redirect_uri) params.set('redirect_uri', redirect_uri);
  if (refresh_token) params.set('refresh_token', refresh_token);
  if (scope) params.set('scope', scope);
  if (code_verifier) params.set('code_verifier', code_verifier);

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
    // Log only safe diagnostics — never log tokens, codes, or secrets
    // eslint-disable-next-line no-console
    console.error(
      `[QF token][${QF_ENV}] /oauth2/token — grant: ${grant_type} — status: ${upstream.status} — error: ${data.error ?? 'unknown'}`
    );
  }

  return NextResponse.json(data, { status: upstream.status });
}
