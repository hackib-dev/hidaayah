'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackHizbReading } from '@/lib/recitationTracking';

const HIZB_START_KEYS: string[] = [
  '1:1',
  '2:75',
  '2:142',
  '2:203',
  '2:253',
  '3:14',
  '3:93',
  '3:171',
  '4:1',
  '4:88',
  '4:148',
  '5:27',
  '5:82',
  '6:36',
  '6:111',
  '6:165',
  '7:88',
  '7:171',
  '8:41',
  '9:1',
  '9:93',
  '10:1',
  '10:71',
  '11:6',
  '11:84',
  '12:53',
  '13:1',
  '14:1',
  '15:1',
  '16:51',
  '16:128',
  '17:99',
  '18:75',
  '19:59',
  '20:83',
  '21:1',
  '21:83',
  '22:19',
  '23:1',
  '24:21',
  '25:21',
  '26:111',
  '27:1',
  '27:56',
  '28:51',
  '29:46',
  '31:1',
  '32:1',
  '33:31',
  '34:24',
  '36:28',
  '37:145',
  '39:32',
  '40:41',
  '41:47',
  '43:24',
  '46:1',
  '48:17',
  '51:31',
  '54:1'
];

interface HizbRecitationViewProps {
  onSelectHizb: (hizbNumber: number, verseKey: string) => void;
}

export function HizbRecitationView({ onSelectHizb }: HizbRecitationViewProps) {
  const [query, setQuery] = useState('');

  const matchesQuery = (juzNum: number, hizbNum: number) => {
    if (query === '') return true;
    const q = query.toLowerCase();
    return (
      String(hizbNum).includes(q) || `juz ${juzNum}`.includes(q) || `hizb ${hizbNum}`.includes(q)
    );
  };

  const juzGroups = Array.from({ length: 30 }, (_, juzIdx) => {
    const juzNum = juzIdx + 1;
    const hizbs = [juzIdx * 2 + 1, juzIdx * 2 + 2].filter((h) => matchesQuery(juzNum, h));
    return { juzNum, hizbs };
  }).filter(({ hizbs }) => hizbs.length > 0);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search hizb or juz number…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Juz groups */}
      <div className="space-y-3">
        {juzGroups.map(({ juzNum, hizbs }, i) => (
          <motion.div
            key={juzNum}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.015 }}
            className="rounded-xl border border-border bg-card overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-secondary/40 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Juz {juzNum}
              </p>
            </div>
            <div className="divide-y divide-border">
              {hizbs.map((hizbNum) => {
                const halfIdx = (hizbNum - 1) % 2;
                const startKey = HIZB_START_KEYS[hizbNum - 1] ?? `${juzNum}:1`;
                return (
                  <div key={hizbNum} className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-primary/10 text-primary">
                      {hizbNum}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Hizb {hizbNum}
                        <span className="text-muted-foreground font-normal ml-1.5 text-xs">
                          ({halfIdx === 0 ? '1st' : '2nd'} half of Juz {juzNum})
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // Track hizb reading (estimate page number based on hizb)
                        trackHizbReading(hizbNum, (hizbNum - 1) * 10 + 1);
                        onSelectHizb(hizbNum, startKey);
                      }}
                      className={cn(
                        'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-primary/10 text-primary hover:bg-primary/20'
                      )}
                    >
                      <BookOpen className="w-3 h-3" />
                      Read
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
