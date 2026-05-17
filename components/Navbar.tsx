'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import HidaayahLogo from './HidaayahLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('hidaayah-theme');

    const isDark =
      savedTheme === 'dark' || (!savedTheme && document.documentElement.classList.contains('dark'));

    setIsDarkMode(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;

    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.classList.add('dark');

      localStorage.setItem('hidaayah-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');

      localStorage.setItem('hidaayah-theme', 'light');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 flex h-16 items-center px-4 sm:px-6 transition-all duration-500 ${
        scrolled ? 'border-b border-border bg-background/85 backdrop-blur-[20px]' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl flex items-center justify-between">
        <div onClick={scrollToTop} className="cursor-pointer flex-shrink-0">
          <HidaayahLogo size={32} />
        </div>
        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground flex-shrink-0"
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="4" fill="currentColor" />

                <path
                  d="M9 3V2M9 16v-1M15 9h1M2 9h1M13.5 4.5l.7-.7M3.8 14.2l.7-.7M13.5 13.5l.7.7M3.8 3.8l.7.7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="currentColor" />

                <path
                  d="M9 1v1M9 16v1M3.22 3.22l.7.7M14.08 14.08l.7.7M1 9h1M16 9h1M3.22 14.78l.7-.7M14.08 3.92l.7-.7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </motion.button>

          {/* Sign In */}
          <motion.button
            onClick={() => router.push('/login')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="hidden px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-normal tracking-[0.02em] text-foreground sm:block flex-shrink-0"
            style={{
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Sign In
          </motion.button>

          {/* Get Started */}
          <motion.button
            onClick={handleGetStarted}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border-none px-4 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base font-medium tracking-[0.02em] text-white whitespace-nowrap flex-shrink-0"
            style={{
              fontFamily: "'Inter', sans-serif",
              background: 'linear-gradient(135deg, var(--emerald), var(--teal))',
              boxShadow: '0 0 20px rgba(15, 194, 176, 0.35)'
            }}
          >
            {isAuthenticated ? 'Dashboard' : 'Get Started'}
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
