import Link from 'next/link';
import HidaayahLogo from '@/components/HidaayahLogo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Hidaayah',
  description: 'Terms of Service and End User License Agreement for Hidaayah.'
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using Hidaayah ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. You must be at least 13 years of age to use the Service, and at least 18 years of age to create an account.`
  },
  {
    title: '2. Description of Service',
    body: `Hidaayah is a web application that provides Quranic guidance, verse discovery, personal reflections, reading progress tracking, and community circles. The Service connects to third-party APIs including Quran Foundation APIs to deliver Quranic content, audio, translations, and user data synchronisation.`
  },
  {
    title: '3. User Accounts',
    body: `To access certain features, you must authenticate via Quran Foundation OAuth 2.0. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to provide accurate and complete information when registering and to update it as necessary.`
  },
  {
    title: '4. Acceptable Use',
    body: `You agree not to: (i) use the Service for any unlawful purpose; (ii) post abusive, offensive, or inappropriate content; (iii) attempt to reverse engineer, scrape, or copy the Service; (iv) interfere with the operation of the Service or its servers; (v) impersonate any person or entity; or (vi) use the Service to transmit unsolicited communications. Hidaayah maintains a zero-tolerance policy for abusive, sexual, or otherwise objectionable content. Violations may result in permanent account termination.`
  },
  {
    title: '5. User-Generated Content',
    body: `You retain ownership of any reflections, notes, or other content you post ("User Content"). By posting User Content, you grant Hidaayah a non-exclusive, royalty-free licence to display and store that content solely for the purpose of providing the Service to you. You are solely responsible for ensuring your User Content does not infringe the rights of third parties or violate any applicable laws.`
  },
  {
    title: '6. Third-Party Services',
    body: `The Service integrates with Quran Foundation APIs (quran.foundation), Quran Reflect, and other third-party services. Your use of those services is subject to their respective terms and privacy policies. Hidaayah is not responsible for the availability, accuracy, or content of third-party services.`
  },
  {
    title: '7. Quranic Content',
    body: `All Quranic text, translations, audio recitations, and tafsir content are provided via Quran Foundation APIs and are subject to their respective licences. This content is made available for personal, non-commercial use only. You may not reproduce or redistribute Quranic content obtained through the Service without proper authorisation.`
  },
  {
    title: '8. Intellectual Property',
    body: `The Hidaayah name, logo, application design, and original code are the intellectual property of Hidaayah. Nothing in these Terms grants you any right to use Hidaayah's trademarks, logos, or other proprietary material without prior written consent.`
  },
  {
    title: '9. Privacy',
    body: `Your use of the Service is also governed by our Privacy Policy, available at hidaayah-chi.vercel.app/privacy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.`
  },
  {
    title: '10. Disclaimer of Warranties',
    body: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. HIDAAYAH DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.`
  },
  {
    title: '11. Limitation of Liability',
    body: `TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, HIDAAYAH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE. HIDAAYAH'S AGGREGATE LIABILITY SHALL NOT EXCEED FIFTY DOLLARS (USD $50).`
  },
  {
    title: '12. Termination',
    body: `Hidaayah may suspend or terminate your access to the Service at any time and for any reason, including violation of these Terms. Upon termination, your right to use the Service will cease immediately.`
  },
  {
    title: '13. Changes to Terms',
    body: `Hidaayah reserves the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Service after any changes constitutes acceptance of the new Terms.`
  },
  {
    title: '14. Governing Law',
    body: `These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be resolved through good-faith negotiation, and if unresolved, through binding arbitration or courts of competent jurisdiction.`
  },
  {
    title: '15. Contact',
    body: `If you have any questions about these Terms of Service, please contact us at: aqibkenn@gmail.com`
  }
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <HidaayahLogo size={28} />
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Privacy Policy
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">
            Effective date: <span className="font-medium text-foreground">May 2026</span>
          </p>
          <p className="text-base text-foreground/80 leading-relaxed">
            Please read these Terms of Service carefully before using Hidaayah. By accessing or
            using the Service, you agree to be bound by these terms.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="text-base font-bold text-foreground">{section.title}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="pt-8 border-t border-border space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hidaayah uses Quran Foundation APIs under licence. Quranic content, translations, and
            audio are provided by{' '}
            <a
              href="https://quran.foundation"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Quran Foundation
            </a>{' '}
            and are subject to their terms.
          </p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
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
