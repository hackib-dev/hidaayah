import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleCtaClick = (type: 'primary' | 'secondary') => {
    if (type === 'primary') {
      router.push(isAuthenticated ? '/dashboard' : '/signup');
    } else {
      router.push(isAuthenticated ? '/dashboard' : '/signup');
    }
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8rem 1.5rem 6rem',
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      {/* Central glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '500px',
          background: 'radial-gradient(ellipse, rgba(15, 194, 176, 0.05) 0%, transparent 65%)',
          pointerEvents: 'none'
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '700px' }}>
        {/* Arabic line */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          dir="rtl"
          style={{
            fontFamily: "'Amiri', serif",
            fontSize: 'clamp(18px, 2.5vw, 24px)',
            color: 'var(--gold)',
            lineHeight: 2,
            marginBottom: '2.5rem',
            opacity: 0.6
          }}
        >
          وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.2 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--teal)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            opacity: 0.7
          }}
        >
          Begin Your Journey
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 300,
            color: 'var(--foreground)',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            marginBottom: '1.5rem'
          }}
        >
          Your return to the
          <br />
          <em
            style={{
              fontStyle: 'italic',
              background: 'linear-gradient(135deg, var(--teal), var(--emerald), var(--gold))',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'var(--teal)'
            }}
          >
            Qur'an starts now.
          </em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '17px',
            fontWeight: 300,
            color: 'var(--muted-foreground)',
            lineHeight: 1.75,
            maxWidth: '500px',
            margin: '0 auto 3.5rem'
          }}
        >
          Join thousands of Muslims rediscovering their most sacred relationship — guided,
          supported, and transformed by Hidaayah.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem'
          }}
        >
          <motion.button
            onClick={() => handleCtaClick('primary')}
            whileHover={{
              scale: 1.04,
              boxShadow: '0 0 50px rgba(15, 194, 176, 0.3)'
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontWeight: 500,
              color: 'var(--primary-foreground)',
              background: 'linear-gradient(135deg, var(--emerald) 0%, var(--teal) 100%)',
              border: 'none',
              borderRadius: '999px',
              padding: '18px 44px',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 0 40px rgba(15, 194, 176, 0.2)',
              transition: 'box-shadow 0.3s ease'
            }}
          >
            Begin Your Journey
          </motion.button>

          <motion.button
            onClick={() => handleCtaClick('secondary')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: 'var(--foreground)',
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '999px',
              padding: '18px 44px',
              cursor: 'pointer',
              letterSpacing: '0.02em'
            }}
          >
            Experience Hidaayah
          </motion.button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 1.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex' }}>
            {['#0FC2B0', '#1C8C73', '#0FC2B0', '#D4A84F', '#0FC2B0'].map((color, i) => (
              <div
                key={i}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}, rgba(var(--background-rgb), 0.5))`,
                  border: '2px solid var(--background)',
                  marginLeft: i > 0 ? '-10px' : 0
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.5 }}
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          padding: '0 2rem'
        }}
      >
        {[
          { label: 'Privacy', href: '/privacy' },
          { label: 'Terms', href: '/terms' }
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 300,
              color: 'var(--muted-foreground)',
              letterSpacing: '0.05em',
              textDecoration: 'none'
            }}
          >
            {label}
          </Link>
        ))}
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 300,
            color: 'var(--muted-foreground)'
          }}
        >
          © 2026 Hidaayah. All rights reserved.
        </span>
      </motion.div>
    </section>
  );
}
