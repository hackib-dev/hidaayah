'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { LogOut, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Home,
  Compass,
  BookOpen,
  Bookmark,
  BookText,
  Users,
  Sprout,
  Brain,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HidaayahLogo from '@/components/HidaayahLogo';
import { useState } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const navItems = [
    { href: user ? '/dashboard' : '/', label: 'Home', icon: Home },
    { href: '/dashboard/quran', label: 'Quran', icon: BookText },
    { href: '/dashboard/guidance', label: 'Guidance', icon: Compass },
    { href: '/dashboard/challenges', label: 'Challenges', icon: Brain },
    { href: '/dashboard/companion', label: 'Companion', icon: MessageCircle }
  ];

  const desktopNavItems = [
    { href: user ? '/dashboard' : '/', label: 'Home', icon: Home },
    { href: '/dashboard/quran', label: 'Quran', icon: BookText },
    { href: '/dashboard/guidance', label: 'Guidance', icon: Compass },
    { href: '/dashboard/garden', label: 'Garden', icon: Sprout },
    { href: '/dashboard/circles', label: 'Circles', icon: Users },
    { href: '/dashboard/challenges', label: 'Challenges', icon: Brain },
    { href: '/dashboard/companion', label: 'Companion', icon: MessageCircle }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="w-full max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <HidaayahLogo size={36} />
            </motion.div>
          </Link>

          <div className="flex items-center gap-2">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-primary"
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30
                      }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard/profile"
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200',
                  pathname === '/dashboard/profile'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {pathname === '/dashboard/profile' && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <User
                    className="w-4 h-4"
                    strokeWidth={pathname === '/dashboard/profile' ? 2.5 : 2}
                  />
                  <span>Profile</span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Tablet Navigation */}
      <nav className="hidden md:block lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <HidaayahLogo size={36} />
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Tablet Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm"
                onClick={() => setIsMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-16 left-0 right-0 bg-background border-b border-border shadow-lg"
              >
                <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/' &&
                        item.href !== '/dashboard' &&
                        pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-secondary'
                        )}
                      >
                        <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="pt-2 mt-2 border-t border-border space-y-1">
                    {user && (
                      <>
                        <Link
                          href="/dashboard/garden"
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                            pathname === '/dashboard/garden'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-secondary'
                          )}
                        >
                          <Sprout
                            className="w-5 h-5"
                            strokeWidth={pathname === '/dashboard/garden' ? 2.5 : 2}
                          />
                          <span>Garden</span>
                        </Link>
                        <Link
                          href="/dashboard/circles"
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                            pathname === '/dashboard/circles'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-secondary'
                          )}
                        >
                          <Users
                            className="w-5 h-5"
                            strokeWidth={pathname === '/dashboard/circles' ? 2.5 : 2}
                          />
                          <span>Circles</span>
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                            pathname === '/dashboard/profile'
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground hover:bg-secondary'
                          )}
                        >
                          <User
                            className="w-5 h-5"
                            strokeWidth={pathname === '/dashboard/profile' ? 2.5 : 2}
                          />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 rounded-xl transition-colors duration-200 touch-active"
              >
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className={cn(
                    'p-1.5 rounded-xl transition-colors duration-200',
                    isActive ? 'bg-primary/15' : ''
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors duration-200',
                    isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <HidaayahLogo size={30} />
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Link
                  href="/dashboard/garden"
                  className={cn(
                    'p-2 rounded-xl transition-colors touch-active',
                    pathname === '/dashboard/garden'
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <Sprout
                    className="w-5 h-5"
                    strokeWidth={pathname === '/dashboard/garden' ? 2.5 : 2}
                  />
                </Link>
                <Link
                  href="/dashboard/circles"
                  className={cn(
                    'p-2 rounded-xl transition-colors touch-active',
                    pathname === '/dashboard/circles'
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  <Users
                    className="w-5 h-5"
                    strokeWidth={pathname === '/dashboard/circles' ? 2.5 : 2}
                  />
                </Link>
              </>
            )}
            {user && (
              <Link
                href="/dashboard/profile"
                className={cn(
                  'p-2 rounded-xl transition-colors touch-active',
                  pathname === '/dashboard/profile'
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                )}
              >
                <User
                  className="w-5 h-5"
                  strokeWidth={pathname === '/dashboard/profile' ? 2.5 : 2}
                />
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
