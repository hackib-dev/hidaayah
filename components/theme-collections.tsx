'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAppState } from '@/components/app-state-provider';
import { Shield, Compass, Sun, Moon, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeCollections() {
  const { themes } = useAppState();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="font-bold text-foreground text-sm md:text-base">Life Themes</h3>
        <Link
          href="/collections"
          className="text-xs md:text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors font-semibold"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {themes.map((theme, index) => {
          const Icon = theme.icon;
          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -2, boxShadow: '0 8px 20px -4px oklch(0 0 0 / 0.10)' }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                href={`/collections/${theme.id}`}
                className={cn(
                  'group rounded-xl border bg-card p-3 transition-colors duration-200 flex items-center gap-3',
                  theme.border
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                    theme.bg,
                    theme.iconColor
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{theme.label}</p>
                  <p className="text-[10px] text-muted-foreground">{theme.count} verses</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
