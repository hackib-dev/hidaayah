import Link from 'next/link';
import HidaayahLogo from '@/components/HidaayahLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Hidaayah',
  description: 'Privacy Policy for Hidaayah — how we collect, use, and protect your data.'
};

const sections = [
  {
    title: '1. Introduction',
    body: `Hidaayah ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use the Hidaayah web application and associated services ("the Service"). Please read this policy carefully. If you do not agree with its terms, please discontinue use of the Service.`
  },
  {
    title: '2. Information We Collect',
    body: `We may collect the following types of information:\n\n• Account information: When you sign in via Quran Foundation OAuth 2.0, we receive your user identifier (sub), name, and email address as provided by Quran Foundation.\n\n• Usage data: We collect information about how you interact with the Service, including pages visited, features used, and reading activity.\n\n• User content: Reflections, notes, bookmarks, and other content you create within the Service.\n\n• Device and browser information: Browser type, operating system, IP address, and similar technical data collected automatically.\n\n• Reading and activity data: Your Quran reading sessions, streaks, goals, and progress, which may be synchronised with Quran Foundation servers.`
  },
  {
    title: '3. How We Use Your Information',
    body: `We use the information we collect to:\n\n• Provide, maintain, and improve the Service.\n• Personalise your experience, including verse recommendations and guidance.\n• Synchronise your data with Quran Foundation APIs (bookmarks, reflections, goals, etc.).\n• Communicate with you about updates or support requests.\n• Monitor and analyse usage patterns to improve the Service.\n• Comply with applicable legal obligations.`
  },
  {
    title: '4. Authentication via Quran Foundation',
    body: `Hidaayah uses Quran Foundation OAuth 2.0 for user authentication. When you sign in, Quran Foundation authenticates your identity and issues an access token. We store this token securely in your browser's local storage solely to make authenticated API requests on your behalf. We do not store your Quran Foundation password. Your use of authentication is also subject to Quran Foundation's own privacy policy at quran.foundation.`
  },
  {
    title: '5. Data Sharing and Disclosure',
    body: `We do not sell your personal information. We may share your information in the following circumstances:\n\n• Quran Foundation: Data necessary to provide the Service (bookmarks, reflections, reading sessions) is transmitted to Quran Foundation APIs as part of normal service operation.\n\n• Service providers: We may share data with trusted third-party providers who assist in operating the Service (e.g. Vercel for hosting, Vercel Analytics for anonymised usage statistics).\n\n• Legal requirements: We may disclose information if required to do so by law or in response to valid legal requests.\n\n• Business transfers: In the event of a merger or acquisition, your data may be transferred as part of that transaction.`
  },
  {
    title: '6. Data Storage and Security',
    body: `The Service is hosted on Vercel. Your access tokens and session data are stored in your browser's local storage and are not transmitted to our servers beyond what is required to proxy API calls. We implement reasonable security measures to protect your information, but no method of transmission over the internet is 100% secure. You are responsible for keeping your device and browser secure.`
  },
  {
    title: '7. Cookies and Local Storage',
    body: `Hidaayah uses browser local storage to store your authentication tokens, theme preferences, and cached data. We do not use third-party tracking cookies. Vercel Analytics may use anonymised, privacy-preserving analytics that do not identify individual users.`
  },
  {
    title: '8. Your Rights',
    body: `Depending on your jurisdiction, you may have the right to:\n\n• Access the personal data we hold about you.\n• Request correction of inaccurate data.\n• Request deletion of your account and associated data.\n• Withdraw consent where processing is based on consent.\n• Lodge a complaint with a supervisory authority.\n\nTo exercise these rights, contact us at aqibkenn@gmail.com. For data held by Quran Foundation, you should contact them directly at quran.foundation.`
  },
  {
    title: "9. Children's Privacy",
    body: `The Service is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately and we will take steps to delete it.`
  },
  {
    title: '10. Third-Party Links and Services',
    body: `The Service may contain links to third-party websites or integrate with third-party services (Quran Foundation, QuranReflect, etc.). We are not responsible for the privacy practices of those third parties. We encourage you to review their privacy policies before providing any personal information.`
  },
  {
    title: '11. Data Retention',
    body: `We retain your data for as long as your account is active or as needed to provide the Service. If you delete your account or request deletion of your data, we will remove your information from our systems within a reasonable time, subject to any legal obligations to retain certain records.`
  },
  {
    title: '12. Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Your continued use of the Service after any changes constitutes acceptance of the updated policy. We encourage you to review this page periodically.`
  },
  {
    title: '13. Contact Us',
    body: `If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us at:\n\nEmail: aqibkenn@gmail.com\nWebsite: hidaayah-chi.vercel.app`
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <HidaayahLogo size={28} />
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Title block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            Legal
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: <span className="font-medium text-foreground">May 2026</span>
          </p>
          <p className="text-base text-foreground/80 leading-relaxed">
            Your privacy matters to us. This policy explains what data Hidaayah collects, why we
            collect it, and how we protect it.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-base font-bold text-foreground">{section.title}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="pt-8 border-t border-border space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hidaayah is powered by{' '}
            <a
              href="https://quran.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Quran Foundation
            </a>{' '}
            APIs. User authentication and data synchronisation are subject to Quran
            Foundation&apos;s own privacy policy.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <a href="mailto:aqibkenn@gmail.com" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
