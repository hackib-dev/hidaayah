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
      .then(async (tokenData) => {
        // Fetch user info from the OIDC userinfo endpoint
        let name = 'User';
        let email = '';
        let sub = '';
        try {
          const oauthBase =
            process.env.NEXT_PUBLIC_QF_OAUTH_BASE_URL || 'https://oauth2.quran.foundation';
          const res = await fetch(`${oauthBase}/userinfo`, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          if (res.ok) {
            const info = await res.json();
            name =
              (info.first_name ? `${info.first_name} ${info.last_name ?? ''}`.trim() : null) ||
              info.name ||
              info.preferred_username ||
              'User';
            email = info.email || '';
            sub = info.sub || '';
          }
        } catch {
          // Non-fatal — proceed with minimal user info
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
