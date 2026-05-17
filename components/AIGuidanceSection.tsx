'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

const PROMPTS = [
  {
    text: 'I feel lost.',
    emotion: 'anxious',

    verse: {
      arabic: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ',

      translation: 'And He found you lost and guided you.',

      reference: 'Ad-Duha 93:7',

      reflection:
        'Even in your lostness, there is a hand reaching out. Your Lord has never lost sight of you.'
    }
  },

  {
    text: 'I feel anxious.',
    emotion: 'anxious',

    verse: {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',

      translation: 'Verily, in the remembrance of Allah do hearts find rest.',

      reference: "Ar-Ra'd 13:28",

      reflection: 'Return to remembrance — not as a ritual, but as a homecoming.'
    }
  },

  {
    text: 'I feel empty.',
    emotion: 'struggling',

    verse: {
      arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',

      translation: 'For indeed, with hardship will be ease.',

      reference: 'Al-Inshirah 94:5-6',

      reflection: 'Ease is not coming after the hardship. It is within it.'
    }
  }
];

const EMOTION_STYLES: Record<
  string,
  {
    bg: string;
    color: string;
  }
> = {
  hopeful: {
    bg: 'rgba(15, 194, 176, 0.12)',
    color: 'var(--teal)'
  },

  grateful: {
    bg: 'rgba(212, 168, 79, 0.12)',
    color: 'var(--gold)'
  },

  struggling: {
    bg: 'rgba(220, 50, 90, 0.12)',
    color: '#E03660'
  },

  anxious: {
    bg: 'rgba(120, 100, 220, 0.12)',
    color: '#7B6FD4'
  },

  peaceful: {
    bg: 'rgba(212, 168, 79, 0.12)',
    color: 'var(--gold)'
  }
};

function ParticleBurst({ active }: { active: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({
        length: 12
      }).map((_, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            x: 0,
            y: 0,
            scale: 0
          }}
          animate={
            active
              ? {
                  opacity: [0, 0.6, 0],

                  x: [0, Math.cos((index / 12) * Math.PI * 2) * 80],

                  y: [0, Math.sin((index / 12) * Math.PI * 2) * 60],

                  scale: [0, 1, 0]
                }
              : {
                  opacity: 0
                }
          }
          transition={{
            duration: 1.4,
            delay: index * 0.04,
            ease: 'easeOut'
          }}
          className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full"
          style={{
            marginLeft: '-2px',
            marginTop: '-2px',

            background:
              index % 3 === 0
                ? 'var(--teal)'
                : index % 3 === 1
                  ? 'var(--gold)'
                  : 'var(--foreground)'
          }}
        />
      ))}
    </div>
  );
}

export default function AIGuidanceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.3
  });

  const [selected, setSelected] = useState<number | null>(null);

  const [displayedIndex, setDisplayedIndex] = useState<number | null>(null);

  const [burst, setBurst] = useState(false);

  const [typed, setTyped] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  const handleSelect = (index: number) => {
    if (isTyping) return;

    setSelected(index);
    setBurst(true);
    setIsTyping(true);
    setTyped('');

    const prompt = PROMPTS[index].text;

    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex++;

      setTyped(prompt.slice(0, currentIndex));

      if (currentIndex >= prompt.length) {
        clearInterval(interval);

        setTimeout(() => {
          setBurst(false);
          setIsTyping(false);
          setDisplayedIndex(index);
        }, 500);
      }
    }, 50);
  };

  useEffect(() => {
    if (isInView && selected === null) {
      const timer = setTimeout(() => {
        handleSelect(0);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isInView, selected]);

  const displayedPrompt = displayedIndex !== null ? PROMPTS[displayedIndex] : null;

  const currentVerse = displayedPrompt?.verse;

  const emotionStyle = displayedPrompt ? EMOTION_STYLES[displayedPrompt.emotion] : null;

  return (
    <section
      ref={sectionRef}
      className="
        relative
        flex
        min-h-screen
        flex-col
        items-center
        justify-center
        overflow-hidden
        bg-background
        px-6
        py-20
      "
    >
      {/* Background Glow */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[500px]
          w-[900px]
          -translate-x-1/2
          -translate-y-1/2
        "
        style={{
          background: 'radial-gradient(ellipse, rgba(var(--teal-rgb),0.04) 0%, transparent 65%)'
        }}
      />

      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                y: 0
              }
            : {}
        }
        transition={{
          duration: 1,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="
          relative
          z-10
          mb-16
          text-center
        "
      >
        <span
          className="
            mb-5
            block
            text-xs
            font-medium
            uppercase
            tracking-[0.25em]
            text-teal-500/70
          "
        >
          AI Guidance
        </span>

        <h2
          className="
            mb-4
            text-4xl
            font-light
            tracking-tight
            text-foreground
            md:text-6xl
          "
          style={{
            fontFamily: "'Cormorant Garamond', serif"
          }}
        >
          What&apos;s on your heart?
        </h2>

        <p
          className="
            mx-auto
            max-w-xl
            text-base
            leading-7
            text-muted-foreground
          "
          style={{
            fontFamily: "'Inter', sans-serif"
          }}
        >
          Open your heart to Hidaayah. Receive verses and wisdom crafted for exactly where you are
          in your spiritual journey.
        </p>
      </motion.div>

      {/* Main Panel */}
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.97
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                y: 0,
                scale: 1
              }
            : {}
        }
        transition={{
          duration: 1.2,
          delay: 0.3,
          ease: [0.16, 1, 0.3, 1]
        }}
        className="
          relative
          z-10
          w-full
          max-w-3xl
          overflow-hidden
          rounded-3xl
          border
          border-border
          bg-card/80
          backdrop-blur-2xl
        "
        style={{
          boxShadow: '0 0 80px rgba(var(--teal-rgb),0.04), 0 40px 80px rgba(0,0,0,0.2)'
        }}
      >
        {/* Panel Header */}
        <div
          className="
            flex
            items-center
            gap-3
            border-b
            border-border
            px-7
            py-5
          "
        >
          <div
            className="
              h-2
              w-2
              rounded-full
            "
            style={{
              background: 'var(--teal)',

              boxShadow: '0 0 8px rgba(var(--teal-rgb),0.6)'
            }}
          />

          <span
            className="
              text-xs
              font-medium
              tracking-wider
              text-teal-500/80
            "
          >
            Hidaayah · Spiritual Guidance
          </span>
        </div>

        {/* Prompt Buttons */}
        <div
          className="
            border-b
            border-border
            px-7
            py-6
          "
        >
          <p
            className="
              mb-4
              text-xs
              uppercase
              tracking-[0.1em]
              text-muted-foreground
            "
          >
            How are you feeling?
          </p>

          <div className="flex flex-wrap gap-3">
            {PROMPTS.map((prompt, index) => {
              const isSelected = selected === index;

              const style = EMOTION_STYLES[prompt.emotion];

              return (
                <motion.button
                  key={prompt.text}
                  whileHover={{
                    scale: 1.02
                  }}
                  whileTap={{
                    scale: 0.96
                  }}
                  onClick={() => handleSelect(index)}
                  className="
                      rounded-full
                      border
                      px-5
                      py-2
                      text-sm
                      font-medium
                      transition-all
                    "
                  style={{
                    color: isSelected ? style.color : 'var(--muted-foreground)',

                    background: isSelected ? style.bg : 'var(--muted)',

                    borderColor: isSelected ? `${style.color}40` : 'var(--border)'
                  }}
                >
                  {prompt.text}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="relative px-7 py-5">
          <ParticleBurst active={burst} />

          <div
            className="
              flex
              min-h-[56px]
              items-center
              gap-3
              rounded-full
              border
              px-5
              py-4
              transition-all
            "
            style={{
              borderColor: isTyping ? 'var(--teal)' : 'var(--border)',

              boxShadow: isTyping ? '0 0 0 4px rgba(var(--teal-rgb),0.1)' : 'none',

              background: 'var(--muted)'
            }}
          >
            <div
              className="
                h-2
                w-2
                rounded-full
                bg-teal-500
              "
            />

            <span
              className="
                flex-1
                text-sm
                text-foreground
              "
            >
              {typed || "Share what's in your heart..."}

              {isTyping && (
                <motion.span
                  animate={{
                    opacity: [1, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity
                  }}
                  className="
                    ml-1
                    inline-block
                    h-4
                    w-[2px]
                    bg-teal-500
                    align-middle
                  "
                />
              )}
            </span>
          </div>
        </div>

        {/* Response */}
        <AnimatePresence mode="wait">
          {currentVerse && emotionStyle && (
            <motion.div
              key={displayedIndex}
              initial={{
                opacity: 0,
                y: 16
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -8
              }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="px-7 pb-7"
            >
              <div
                className="
                    rounded-2xl
                    border
                    p-8
                  "
                style={{
                  background: emotionStyle.bg,

                  borderColor: `${emotionStyle.color}40`
                }}
              >
                {/* Arabic */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.1
                  }}
                  dir="rtl"
                  className="
                      mb-5
                      text-right
                      font-[var(--font-amiri)]
                      text-2xl
                      leading-loose
                      text-gold
                      opacity-90
                      md:text-3xl
                    "
                >
                  {currentVerse.arabic}
                </motion.div>

                {/* Translation */}
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 8
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3
                  }}
                  className="
                      mb-2
                      text-lg
                      italic
                      leading-8
                      text-foreground/80
                    "
                  style={{
                    fontFamily: "'Cormorant Garamond', serif"
                  }}
                >
                  "{currentVerse.translation}"
                </motion.p>

                {/* Reference */}
                <motion.div
                  initial={{
                    opacity: 0
                  }}
                  animate={{
                    opacity: 1
                  }}
                  transition={{
                    duration: 0.8,
                    delay: 0.4
                  }}
                  className="
                      mb-6
                      text-xs
                      tracking-wider
                    "
                  style={{
                    color: emotionStyle.color
                  }}
                >
                  — {currentVerse.reference}
                </motion.div>

                {/* Divider */}
                <div
                  className="
                      mb-6
                      h-px
                      w-full
                    "
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--border), transparent)'
                  }}
                />

                {/* Reflection */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.9,
                    delay: 0.6
                  }}
                  className="
                      flex
                      items-start
                      gap-4
                    "
                >
                  <div
                    className="
                        mt-1
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                      "
                    style={{
                      background: 'linear-gradient(135deg, var(--emerald), var(--teal))',

                      boxShadow: '0 0 12px rgba(var(--teal-rgb),0.3)'
                    }}
                  >
                    <div
                      className="
                          h-2
                          w-2
                          rounded-full
                          bg-white
                        "
                    />
                  </div>

                  <p
                    className="
                        text-sm
                        leading-8
                        text-muted-foreground
                      "
                  >
                    {currentVerse.reflection}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
