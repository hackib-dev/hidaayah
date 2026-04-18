import { NextResponse } from 'next/server';

const isPrelive =
  process.env.QF_ENV === 'prelive' ||
  (process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL ?? '').includes('prelive');

const QF_ENV = isPrelive ? 'prelive' : 'production';
const REFRESH_COOKIE = `qf_refresh_${QF_ENV}`;

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 0
  });
  return response;
}
