'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';

type Tab = 'mushaf' | 'translation';

const TABS: { id: Tab; label: string; caption: string }[] = [
  {
    id: 'mushaf',
    label: 'Mushaf',
    caption: 'Beautiful Uthmani script with tajweed colouring and verse-by-verse navigation.'
  },
  {
    id: 'translation',
    label: 'Translation',
    caption: 'Side-by-side translation with tafsir notes and word-by-word breakdown.'
  }
];

// ─────────────────────────────────────────────
// Mushaf Interface
// ─────────────────────────────────────────────

function MushafInterface({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="relative flex aspect-[9/16] w-full flex-col gap-6 overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: isDark ? '#071521' : '#F8F4ED'
      }}
    >
      {/* Header */}
      <div
        className="border-b pb-4 text-center"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }}
      >
        <div
          className="mb-1 font-serif text-[18px] font-semibold"
          style={{
            fontFamily: "'Amiri', serif",
            color: 'var(--gold)'
          }}
        >
          سُورَةُ البَقَرَةِ
        </div>

        <div
          className="text-[11px] tracking-[0.1em]"
          style={{
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
          }}
        >
          AL-BAQARAH · AYAH 2-3
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-5">
        {/* Verse 1 */}
        <div>
          <div
            dir="rtl"
            className="text-right leading-[2]"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: '22px',
              color: isDark ? '#E8EDF2' : '#1A1A1A'
            }}
          >
            <span style={{ color: 'var(--teal)' }}>ذَٰلِكَ</span> <span>الْكِتَابُ</span>{' '}
            <span style={{ color: 'var(--teal)' }}>لَا رَيْبَ</span> <span>فِيهِ</span>{' '}
            <span style={{ color: 'var(--gold)' }}>هُدًى</span> <span>لِّلْمُتَّقِينَ</span>
          </div>

          <div
            className="mt-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px]"
            style={{
              borderColor: 'var(--gold)',
              color: 'var(--gold)',
              fontFamily: "'Amiri', serif"
            }}
          >
            ٢
          </div>
        </div>

        {/* Verse 2 */}
        <div>
          <div
            dir="rtl"
            className="text-right leading-[2]"
            style={{
              fontFamily: "'Amiri', serif",
              fontSize: '22px',
              color: isDark ? '#E8EDF2' : '#1A1A1A'
            }}
          >
            <span>الَّذِينَ</span> <span style={{ color: 'var(--teal)' }}>يُؤْمِنُونَ</span>{' '}
            <span>بِالْغَيْبِ</span> <span>وَيُقِيمُونَ</span>{' '}
            <span style={{ color: 'var(--teal)' }}>الصَّلَاةَ</span>
          </div>

          <div
            className="mt-2 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px]"
            style={{
              borderColor: 'var(--gold)',
              color: 'var(--gold)',
              fontFamily: "'Amiri', serif"
            }}
          >
            ٣
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between border-t pt-4"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: isDark ? 'rgba(15,194,176,0.15)' : 'rgba(11,107,92,0.1)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M8 3L4 7L8 11"
              stroke={isDark ? '#0FC2B0' : '#0B6B5C'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div
          className="text-xs"
          style={{
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
          }}
        >
          Page 2 of 604
        </div>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            background: isDark ? 'rgba(15,194,176,0.15)' : 'rgba(11,107,92,0.1)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M6 3L10 7L6 11"
              stroke={isDark ? '#0FC2B0' : '#0B6B5C'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Translation Interface
// ─────────────────────────────────────────────

function TranslationInterface({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="relative flex aspect-[9/16] w-full flex-col gap-6 overflow-hidden rounded-2xl p-6 md:p-8"
      style={{
        background: isDark ? '#071521' : '#F8F4ED'
      }}
    >
      {/* Header */}
      <div
        className="border-b pb-4 text-center"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }}
      >
        <div
          className="mb-1 text-sm font-semibold"
          style={{
            color: 'var(--teal)'
          }}
        >
          Al-Baqarah 2:2-3
        </div>

        <div
          className="text-[11px] tracking-[0.05em]"
          style={{
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
          }}
        >
          Translation & Tafsir
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {[2, 3].map((verse) => (
          <div
            key={verse}
            className="rounded-lg border-l-[3px] p-4"
            style={{
              background: isDark ? 'rgba(15,194,176,0.08)' : 'rgba(11,107,92,0.05)',
              borderColor: 'var(--teal)'
            }}
          >
            <div
              dir="rtl"
              className="mb-3 text-right leading-[1.8]"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: '16px',
                color: 'var(--gold)'
              }}
            >
              {verse === 2
                ? 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ'
                : 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ'}
            </div>

            <div
              className="mb-2 text-[13px] leading-[1.7]"
              style={{
                color: isDark ? '#E8EDF2' : '#2A2A2A'
              }}
            >
              {verse === 2
                ? 'This is the Book about which there is no doubt, a guidance for those conscious of Allah.'
                : 'Who believe in the unseen, establish prayer, and spend out of what We have provided for them.'}
            </div>

            <div
              className="text-[11px] italic leading-[1.6]"
              style={{
                color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'
              }}
            >
              💡{' '}
              {verse === 2
                ? "The Qur'an presents itself with certainty — guidance for the muttaqeen."
                : 'Faith in the unseen is paired with prayer and generosity.'}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Tabs */}
      <div
        className="flex gap-2 border-t pt-4"
        style={{
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
        }}
      >
        {['Translation', 'Tafsir', 'Word by Word'].map((tab, i) => (
          <div
            key={tab}
            className="flex-1 rounded-lg py-2 text-center text-[11px]"
            style={{
              background:
                i === 0
                  ? isDark
                    ? 'rgba(15,194,176,0.15)'
                    : 'rgba(11,107,92,0.1)'
                  : 'transparent',
              color:
                i === 0
                  ? isDark
                    ? '#0FC2B0'
                    : '#0B6B5C'
                  : isDark
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(0,0,0,0.5)',
              fontWeight: i === 0 ? 500 : 400
            }}
          >
            {tab}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────

export default function QuranExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const inView = useInView(sectionRef, {
    once: true,
    amount: 0.15
  });

  const [activeTab, setActiveTab] = useState<Tab>('mushaf');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const activeData = TABS.find((t) => t.id === activeTab)!;

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[var(--background)] py-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mb-14 px-6 text-center"
      >
        <div
          className="mb-5 text-xs font-medium uppercase tracking-[0.25em]"
          style={{
            color: 'var(--gold)',
            opacity: 0.7
          }}
        >
          The Reading Experience
        </div>

        <h2
          className="mx-auto max-w-4xl leading-[1.15]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(36px,5.5vw,64px)',
            fontWeight: 300,
            color: 'var(--foreground)'
          }}
        >
          The Qur&apos;an as a <em style={{ color: 'var(--gold)' }}>living art.</em>
        </h2>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 0.8,
          delay: 0.15,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mb-10 flex justify-center px-6"
      >
        <div className="flex gap-1 rounded-full bg-[var(--muted)] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="rounded-full px-8 py-3 text-sm font-medium transition-all duration-300"
              style={{
                background:
                  activeTab === tab.id
                    ? 'linear-gradient(135deg, var(--emerald), var(--teal))'
                    : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--muted-foreground)',
                boxShadow: activeTab === tab.id ? '0 2px 16px rgba(var(--teal-rgb),0.35)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Device */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{
          duration: 1,
          delay: 0.25,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="mx-auto w-full max-w-[420px] px-6"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="overflow-hidden rounded-2xl"
            style={{
              boxShadow: isDark
                ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(15,194,176,0.1)'
                : '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px rgba(11,107,92,0.08)'
            }}
          >
            {activeTab === 'mushaf' ? (
              <MushafInterface isDark={isDark} />
            ) : (
              <TranslationInterface isDark={isDark} />
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Caption */}
      <motion.p
        key={`${activeTab}-caption`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.4,
          delay: 0.1
        }}
        className="mx-auto mt-8 max-w-[520px] px-6 text-center text-[15px] leading-[1.7]"
        style={{
          color: 'var(--muted-foreground)',
          fontWeight: 300
        }}
      >
        {activeData.caption}
      </motion.p>
    </section>
  );
}
