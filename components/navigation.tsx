'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Home, Compass, BookOpen, Bookmark, BookText, Users, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';
import HidaayahLogo from '@/components/HidaayahLogo';

export function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const navItems = [
    { href: user ? '/dashboard' : '/', label: 'Home', icon: Home },
    { href: '/dashboard/quran', label: 'Quran', icon: BookText },
    { href: '/dashboard/guidance', label: 'Guidance', icon: Compass },
    { href: '/dashboard/circles', label: 'Circles', icon: Users },
    { href: '/dashboard/reflections', label: 'Journal', icon: BookOpen },
    { href: '/dashboard/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/dashboard/garden', label: 'Garden', icon: Leaf }
  ];

  return (
    <>
      {/* Desktop / Tablet Navigation — shown at md (768px) and above */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 h-14 lg:h-16 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <HidaayahLogo size={30} />
            </motion.div>
          </Link>

          {/* Nav items — icon-only on md/lg tablets, icon + label on xl+ */}
          <div className="flex items-center gap-0.5 lg:gap-1 flex-1 justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'relative flex items-center gap-2 px-2.5 py-2 lg:px-3 xl:px-3.5 rounded-xl text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                    {/* Label hidden on tablets (md–lg), visible on xl+ */}
                    <span className="hidden xl:inline">{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Link
                href="/dashboard/profile"
                title="Profile"
                className={cn(
                  'relative flex items-center gap-2 px-2.5 py-2 lg:px-3 rounded-xl text-sm font-medium transition-colors duration-200',
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
                  <span className="hidden xl:inline">Profile</span>
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Log out"
                className="px-2.5 py-2 lg:px-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-14 px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1.5 rounded-xl transition-colors duration-200 touch-active"
              >
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className={cn(
                    'p-1 rounded-lg transition-colors duration-200',
                    isActive ? 'bg-primary/15' : ''
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span
                  className={cn(
                    'text-[9px] font-medium transition-colors duration-200 leading-none',
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
            <HidaayahLogo size={28} />
          </Link>
          {user && (
            <Link
              href="/dashboard/profile"
              className={cn(
                'p-2 rounded-xl transition-colors touch-active',
                pathname === '/dashboard/profile'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <User className="w-5 h-5" />
            </Link>
          )}
        </div>
      </header>
    </>
  );
}
