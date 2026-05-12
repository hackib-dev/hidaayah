import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display, Amiri } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { AppStateProvider } from '@/components/app-state-provider';
import { ReciterPreferenceProvider } from '@/components/reciter-preference-provider';
import { CompanionOverlay } from '@/components/CompanionOverlay';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap'
});

const amiri = Amiri({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700'],
  variable: '--font-arabic',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Hidaayah - Your Quranic Guidance Companion',
  description:
    'Transform life moments into spiritual growth. Real-time Quranic guidance that connects divine wisdom to your lived experience.',
  keywords: ['Quran', 'Islamic', 'Spiritual', 'Guidance', 'Reflection', 'Muslim', 'Tafsir'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hidaayah'
  },
  icons: {
    icon: [{ url: '/icons/favicon.svg', type: 'image/svg+xml' }],
    apple: '/icons/icon-192x192.png'
  }
};

export const viewport: Viewport = {
  themeColor: '#2a6b5f',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${playfair.variable} ${amiri.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-background min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <ReciterPreferenceProvider>
              <AppStateProvider>
                {children}
                <CompanionOverlay />
              </AppStateProvider>
            </ReciterPreferenceProvider>
          </AuthProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
