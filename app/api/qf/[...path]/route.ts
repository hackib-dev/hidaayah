import { NextRequest, NextResponse } from 'next/server';

// ─── Server-side proxy for Quran Foundation user + reflect APIs ───────────────
// Basit (QF team) confirmed that direct browser calls from third-party origins
// are blocked on prelive. All /auth and /quran-reflect requests must go through
// this proxy so the origin is our own Vercel domain, not the browser.

const isPrelive =
  process.env.QF_ENV === 'prelive' ||
  (process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL ?? '').includes('prelive');

const API_BASE = isPrelive
  ? 'https://apis-prelive.quran.foundation'
  : 'https://apis.quran.foundation';

const QF_AUTH_BASE = `${API_BASE}/auth`;
const QF_REFLECT_BASE = `${API_BASE}/quran-reflect`;

const CLIENT_ID = process.env.NEXT_PUBLIC_QF_CLIENT_ID || '';

// Path prefix → upstream base URL
function resolveUpstream(segments: string[]): { base: string; rest: string } | null {
  if (segments[0] === 'auth') {
    return { base: QF_AUTH_BASE, rest: segments.slice(1).join('/') };
  }
  if (segments[0] === 'reflect') {
    return { base: QF_REFLECT_BASE, rest: segments.slice(1).join('/') };
  }
  return null;
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const resolved = resolveUpstream(path);

  if (!resolved) {
    return NextResponse.json({ error: 'Unknown proxy path' }, { status: 400 });
  }

  const search = req.nextUrl.search;
  const upstreamUrl = `${resolved.base}/${resolved.rest}${search}`;

  // Forward the auth token and client id from the incoming request headers
  const authToken = req.headers.get('x-auth-token') || '';
  const clientId = req.headers.get('x-client-id') || CLIENT_ID;

  const headers: Record<string, string> = {
    'x-auth-token': authToken,
    'x-client-id': clientId,
    'Content-Type': req.headers.get('content-type') || 'application/json'
  };

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.text() : undefined;

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers,
    body
  });

  const data = await upstream.text();

  return new NextResponse(data, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') || 'application/json' }
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
