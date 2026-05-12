'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, BookOpen, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchVersesByJuz } from '@/app/(app)/dashboard/quran/queries';
import { trackJuzReading } from '@/lib/recitationTracking';

const JUZ_META: { name: string; start: string }[] = [
  { name: 'Al-Fatiha', start: '1:1' },
  { name: 'Al-Baqarah', start: '2:142' },
  { name: 'Al-Baqarah', start: '2:253' },
  { name: 'Ali Imran', start: '3:93' },
  { name: 'An-Nisa', start: '4:24' },
  { name: 'An-Nisa', start: '4:148' },
  { name: 'Al-Maidah', start: '5:82' },
  { name: 'Al-Anam', start: '6:111' },
  { name: 'Al-Araf', start: '7:88' },
  { name: 'Al-Anfal', start: '8:41' },
  { name: 'At-Tawbah', start: '9:93' },
  { name: 'Hud', start: '11:6' },
  { name: 'Yusuf', start: '12:53' },
  { name: 'Al-Hijr', start: '15:1' },
  { name: 'Al-Isra', start: '17:1' },
  { name: 'Al-Kahf', start: '18:75' },
  { name: 'Al-Anbiya', start: '21:1' },
  { name: 'Al-Muminun', start: '23:1' },
  { name: 'Al-Furqan', start: '25:21' },
  { name: 'An-Naml', start: '27:56' },
  { name: 'Al-Ankabut', start: '29:46' },
  { name: 'Al-Ahzab', start: '33:31' },
  { name: 'Ya-Sin', start: '36:28' },
  { name: 'Az-Zumar', start: '39:32' },
  { name: 'Fussilat', start: '41:47' },
  { name: 'Al-Ahqaf', start: '46:1' },
  { name: 'Adh-Dhariyat', start: '51:31' },
  { name: 'Al-Mujadila', start: '58:1' },
  { name: 'Al-Mulk', start: '67:1' },
  { name: 'An-Naba', start: '78:1' }
];

interface JuzRecitationViewProps {
  onSelectJuz: (juzNumber: number, verseKey: string) => void;
}

export function JuzRecitationView({ onSelectJuz }: JuzRecitationViewProps) {
  const [loadingJuz, setLoadingJuz] = useState<number | null>(null);
  const [query, setQuery] = useState('');

  const filtered = JUZ_META.map((meta, i) => ({ ...meta, juzNum: i + 1 })).filter(
    ({ juzNum, name }) =>
      query === '' ||
      String(juzNum).includes(query) ||
      name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = async (juzNum: number, start: string) => {
    setLoadingJuz(juzNum);
    try {
      const res = await fetchVersesByJuz(juzNum, { per_page: 1, page: 1 });
      const firstVerse = res.verses?.[0]?.verse_key ?? start;
      // Track juz reading (estimate page number based on juz)
      trackJuzReading(juzNum, (juzNum - 1) * 20 + 1);
      onSelectJuz(juzNum, firstVerse);
    } catch {
      trackJuzReading(juzNum, (juzNum - 1) * 20 + 1);
      onSelectJuz(juzNum, start);
    } finally {
      setLoadingJuz(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search juz by number or surah name…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-2">
        {filtered.map(({ juzNum, name, start }, i) => {
          const isLoading = loadingJuz === juzNum;
          return (
            <motion.div
              key={juzNum}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.012 }}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/20 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-primary/10 text-primary">
                {juzNum}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Juz {juzNum}</p>
                <p className="text-xs text-muted-foreground">Begins with {name}</p>
              </div>
              <button
                onClick={() => handleSelect(juzNum, start)}
                disabled={isLoading}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <BookOpen className="w-3.5 h-3.5" />
                    Read
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
