import { NextRequest, NextResponse } from 'next/server';

// User auth client — authorization_code + refresh_token grants
const AUTH_OAUTH_BASE =
  process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL || 'https://oauth2.quran.foundation';
const AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';
const AUTH_CLIENT_SECRET = process.env.QF_CLIENT_SECRET || '';

// Content client — client_credentials grant only
const CONTENT_OAUTH_BASE = 'https://oauth2.quran.foundation';
const CONTENT_CLIENT_ID = process.env.QF_CONTENT_CLIENT_ID || '';
const CONTENT_CLIENT_SECRET = process.env.QF_CONTENT_CLIENT_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { grant_type, code, redirect_uri, refresh_token, scope, code_verifier } = body;

  const isContentGrant = grant_type === 'client_credentials';

  const oauthBase = isContentGrant ? CONTENT_OAUTH_BASE : AUTH_OAUTH_BASE;
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

  const data = await upstream.json();

  if (!upstream.ok) {
    console.error('[/api/auth/token] OAuth error:', JSON.stringify(data));
  }

  return NextResponse.json(data, { status: upstream.status });
}
