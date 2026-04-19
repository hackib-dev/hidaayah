'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { exchangeCodeForToken } from '@/app/apiService/quranFoundationService/oauth';
import { useAuth } from '@/components/auth-provider';
import { AlertCircle } from 'lucide-react';

const REDIRECT_URI =
  process.env.NEXT_PUBLIC_QF_OAUTH_REDIRECT_URI || 'http://localhost:3000/callback';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUserFromToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(`OAuth error: ${searchParams.get('error_description') || errorParam}`);
      return;
    }

    if (!code) {
      setError('No authorization code received.');
      return;
    }

    // Validate state to prevent CSRF
    const savedState = sessionStorage.getItem('oauth_state');
    if (savedState && state !== savedState) {
      setError('State mismatch. Please try signing in again.');
      return;
    }

    exchangeCodeForToken(code, REDIRECT_URI)
      .then((tokenData) => {
        // Decode the id_token JWT to get user info — no extra network call needed.
        // The docs recommend this over calling /userinfo.
        let name = 'User';
        let email = '';
        let sub = '';

        if (tokenData.id_token) {
          try {
            // JWT is three base64url parts separated by dots — decode the payload (middle part)
            const payload = JSON.parse(
              atob(tokenData.id_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
            );
            // eslint-disable-next-line no-console
            console.log('[QF id_token payload]', payload);
            sub = payload.sub || '';
            email = payload.email || '';
            name =
              (payload.first_name
                ? `${payload.first_name} ${payload.last_name ?? ''}`.trim()
                : null) ||
              payload.preferred_username ||
              'User';
          } catch {
            // Non-fatal — proceed with minimal user info
          }
        }

        setUserFromToken({ name, email, sub });
        router.replace('/home');
      })
      .catch((err) => {
        console.error('Token exchange failed:', err);
        setError('Sign-in failed. Please try again.');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => router.replace('/login')}
            className="text-sm text-primary font-semibold hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  );
}
