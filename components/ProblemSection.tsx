'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const floatingWords = [
  {
    text: 'anxiety',
    x: '8%',
    y: '10%',
    size: '22px',
    delay: 0.1,
    mobileHide: false
  },
  {
    text: 'distraction',
    x: '68%',
    y: '8%',
    size: '17px',
    delay: 0.3,
    mobileHide: false
  },
  {
    text: 'emptiness',
    x: '2%',
    y: '38%',
    size: '20px',
    delay: 0.5,
    mobileHide: false
  },
  {
    text: 'noise',
    x: '82%',
    y: '32%',
    size: '20px',
    delay: 0.2,
    mobileHide: false
  },
  {
    text: 'searching',
    x: '52%',
    y: '18%',
    size: '18px',
    delay: 0.7,
    mobileHide: false
  },
  {
    text: 'overwhelmed',
    x: '28%',
    y: '88%',
    size: '20px',
    delay: 0.4,
    mobileHide: false
  },
  {
    text: 'lost',
    x: '80%',
    y: '72%',
    size: '24px',
    delay: 0.6,
    mobileHide: true
  },
  {
    text: 'hollow',
    x: '3%',
    y: '78%',
    size: '16px',
    delay: 0.8,
    mobileHide: false
  },
  {
    text: 'restless',
    x: '60%',
    y: '84%',
    size: '19px',
    delay: 0.35,
    mobileHide: false
  }
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  const inView = useInView(sectionRef, {
    once: true,
    amount: 0.25
  });

  const verseRef = useRef<HTMLDivElement | null>(null);

  const verseInView = useInView(verseRef, {
    once: true,
    amount: 0.8
  });

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-8 py-32"
    >
      {/* Floating Emotional Words */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {floatingWords.map((word, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={
              inView
                ? {
                    opacity: 0.22,
                    y: 0
                  }
                : {
                    opacity: 0,
                    y: 10
                  }
            }
            transition={{
              duration: 1.5,
              delay: word.delay,
              ease: [0.16, 1, 0.3, 1]
            }}
            className={`absolute select-none italic text-muted-foreground max-w-[45vw] sm:max-w-none ${word.mobileHide ? 'hidden sm:block' : ''}`}
            style={{
              left: word.x,
              top: word.y,
              fontSize: `clamp(13px, ${word.size}, ${word.size})`,
              fontWeight: 300,
              fontFamily: "'Cormorant Garamond', serif",
              filter: 'blur(0.5px)'
            }}
          >
            {word.text}
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-[5] max-w-[720px] text-center">
        {/* Eyebrow */}
        <motion.div
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={
            inView
              ? {
                  opacity: 1,
                  y: 0
                }
              : {}
          }
          transition={{
            duration: 1,
            delay: 0.2
          }}
          className="mb-10 text-xs font-medium uppercase tracking-[0.25em] text-teal"
          style={{
            fontFamily: "'Inter', sans-serif"
          }}
        >
          The Human Condition
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{
            opacity: 0,
            y: 24
          }}
          animate={
            inView
              ? {
                  opacity: 1,
                  y: 0
                }
              : {}
          }
          transition={{
            duration: 1.3,
            delay: 0.5,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="mb-14 text-[clamp(38px,6vw,72px)] font-light leading-[1.15] tracking-[-0.01em] text-foreground"
          style={{
            fontFamily: "'Cormorant Garamond', serif"
          }}
        >
          We searched everywhere
          <br />
          <em className="italic text-muted-foreground">for peace.</em>
        </motion.h2>

        {/* Verse Reveal */}
        <div ref={verseRef}>
          {/* Divider */}
          <motion.div
            initial={{
              opacity: 0,
              scaleX: 0
            }}
            animate={
              verseInView
                ? {
                    opacity: 1,
                    scaleX: 1
                  }
                : {}
            }
            transition={{
              duration: 1.2,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="mx-auto mb-10 h-px w-20 origin-center opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)'
            }}
          />

          {/* Verse Card */}
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={
              verseInView
                ? {
                    opacity: 1,
                    y: 0
                  }
                : {}
            }
            transition={{
              duration: 1.4,
              delay: 0.5,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="mb-10 rounded-[24px] border border-border bg-card p-10"
          >
            {/* Arabic */}
            <div
              dir="rtl"
              className="mb-5 text-[clamp(22px,3vw,30px)] leading-[1.9] text-gold"
              style={{
                fontFamily: "'Amiri', serif",
                fontWeight: 400
              }}
            >
              أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
            </div>

            {/* Translation */}
            <div
              className="mb-3 text-[20px] italic text-foreground"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 300
              }}
            >
              &quot;Verily, in the remembrance of Allah do hearts find rest.&quot;
            </div>

            {/* Reference */}
            <div
              className="text-xs tracking-[0.1em] text-muted-foreground"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400
              }}
            >
              Ar-Ra&apos;d 13:28
            </div>
          </motion.div>

          {/* Closing Statement */}
          <motion.p
            initial={{
              opacity: 0,
              y: 16
            }}
            animate={
              verseInView
                ? {
                    opacity: 1,
                    y: 0
                  }
                : {}
            }
            transition={{
              duration: 1.2,
              delay: 0.9,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="text-[clamp(22px,3vw,30px)] font-light italic leading-[1.5] text-foreground"
            style={{
              fontFamily: "'Cormorant Garamond', serif"
            }}
          >
            Yet the guidance we needed was always with us.
          </motion.p>
        </div>
      </div>

      {/* Bottom Glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 h-[250px] w-[600px] -translate-x-1/2"
        style={{
          background:
            'radial-gradient(ellipse at bottom, rgba(15, 194, 176, 0.05) 0%, transparent 70%)'
        }}
      />
    </section>
  );
}
