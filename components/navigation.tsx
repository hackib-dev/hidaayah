'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Home, Compass, BookOpen, Bookmark, BookText } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const navItems = [
    { href: user ? '/home' : '/', label: 'Home', icon: Home },
    { href: '/quran', label: 'Quran', icon: BookText },
    { href: '/guidance', label: 'Guidance', icon: Compass },
    { href: '/reflections', label: 'Journal', icon: BookOpen },
    { href: '/bookmarks', label: 'Saved', icon: Bookmark }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="w-full max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm"
            >
              <span className="text-primary-foreground font-serif text-lg font-bold">H</span>
            </motion.div>
            <span className="text-lg font-bold text-foreground tracking-tight">Hidaayah</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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
                href="/profile"
                className={cn(
                  'relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-200',
                  pathname === '/profile'
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                {pathname === '/profile' && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={pathname === '/profile' ? 2.5 : 2} />
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-serif text-base font-bold">H</span>
            </div>
            <span className="text-base font-bold text-foreground tracking-tight">Hidaayah</span>
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors touch-active"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
