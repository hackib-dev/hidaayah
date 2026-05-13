'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchVersesByPage,
  fetchVerseAudioFiles,
  fetchReciters,
  fetchJuzs,
  fetchHizbs,
  fetchPageForVerseKey,
  fetchChapter
} from '@/app/(app)/dashboard/quran/queries';
import type { Verse, Word, Reciter, Juz, Hizb } from '@/app/(app)/dashboard/quran/types';
import { cn } from '@/lib/utils';
import { QF_DEFAULT_RECITER_ID } from '@/config';

const CDN = 'https://verses.quran.foundation';
const TOTAL_PAGES = 604;

// ─── Font / Style options ──────────────────────────────────────────────────────

type MushafFont = 'qcf_v2' | 'uthmani' | 'indopak';

interface FontOption {
  id: MushafFont;
  label: string;
  arabicLabel: string;
  description: string;
  sampleText: string;
}

const FONT_OPTIONS: FontOption[] = [
  {
    id: 'qcf_v2',
    label: 'Madani (QCF)',
    arabicLabel: 'مصحف المدينة',
    description: 'Matches the printed Medina Mushaf exactly',
    sampleText: 'بِسۡمِ ٱللَّهِ'
  },
  {
    id: 'uthmani',
    label: 'Uthmani',
    arabicLabel: 'عثماني',
    description: 'Standard Uthmani Unicode script',
    sampleText: 'بِسْمِ اللَّهِ'
  },
  {
    id: 'indopak',
    label: 'IndoPak',
    arabicLabel: 'هندي/باكستاني',
    description: 'South Asian Nastaleeq style',
    sampleText: 'بِسْمِ اللہِ'
  }
];

type PageTheme = 'cream' | 'white' | 'dark';

interface ThemeOption {
  id: PageTheme;
  label: string;
  bg: string;
  text: string;
  border: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'cream', label: 'Cream', bg: '#fdf8f0', text: '#2d1f0e', border: 'rgba(217,180,120,0.4)' },
  { id: 'white', label: 'White', bg: '#ffffff', text: '#111111', border: 'rgba(0,0,0,0.1)' },
  { id: 'dark', label: 'Dark', bg: '#1a1510', text: '#e8d5b0', border: 'rgba(180,140,80,0.3)' }
];

// ─── Font loading ──────────────────────────────────────────────────────────────

interface MushafPageViewProps {
  startPage: number;
  chapterName?: string;
  onPageChange?: (page: number) => void;
}

interface LineWord extends Word {
  verseKey: string;
  verseNumber: number;
}

const loadedQcfFonts = new Set<number>();

async function loadQcfPageFont(pageNumber: number): Promise<void> {
  if (loadedQcfFonts.has(pageNumber) || typeof document === 'undefined') return;
  try {
    const fontFace = new FontFace(
      `QCFPage${pageNumber}`,
      `url('${CDN}/fonts/quran/hafs/v2/woff2/p${pageNumber}.woff2')`
    );
    fontFace.display = 'block';
    await fontFace.load();
    document.fonts.add(fontFace);
    loadedQcfFonts.add(pageNumber);
  } catch {
    // fallback to UthmanicHafs
  }
}

let indopakLoaded = false;
async function loadIndopakFont(): Promise<void> {
  if (indopakLoaded || typeof document === 'undefined') return;
  try {
    const fontFace = new FontFace(
      'IndoPakNastaleeq',
      `url('${CDN}/fonts/quran/hafs/nastaleeq/indopak/indopak-nastaleeq-waqf-lazim-v4.2.1.woff2')`
    );
    fontFace.display = 'swap';
    await fontFace.load();
    document.fonts.add(fontFace);
    indopakLoaded = true;
  } catch {
    // fallback
  }
}

function groupByLine(verses: Verse[]): Map<number, LineWord[]> {
  const lines = new Map<number, LineWord[]>();
  for (const verse of verses) {
    for (const word of verse.words) {
      const ln = word.line_number;
      if (!lines.has(ln)) lines.set(ln, []);
      lines.get(ln)!.push({ ...word, verseKey: verse.verse_key, verseNumber: verse.verse_number });
    }
  }
  return lines;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MushafPageView({ startPage, chapterName, onPageChange }: MushafPageViewProps) {
  const [page, setPage] = useState(startPage);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fontReady, setFontReady] = useState(false);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [font, setFont] = useState<MushafFont>('qcf_v2');
  const [theme, setTheme] = useState<PageTheme>('cream');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('sm');

  // Audio
  const [audioFiles, setAudioFiles] = useState<{ verse_key: string; url: string }[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentVerseKey, setCurrentVerseKey] = useState<string | null>(null);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedReciterId, setSelectedReciterId] = useState(QF_DEFAULT_RECITER_ID);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [hizbs, setHizbs] = useState<Hizb[]>([]);
  const [selectedJuz, setSelectedJuz] = useState<number | ''>('');
  const [selectedHizb, setSelectedHizb] = useState<number | ''>('');
  const [navigating, setNavigating] = useState(false);
  const [currentChapterName, setCurrentChapterName] = useState<string | undefined>(chapterName);
  const [chapterNames, setChapterNames] = useState<
    Record<number, { arabic: string; simple: string }>
  >({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (p: number) => {
      const clamped = Math.max(1, Math.min(TOTAL_PAGES, p));
      setPage(clamped);
      onPageChange?.(clamped);
    },
    [onPageChange]
  );

  useEffect(() => {
    setPage(startPage);
  }, [startPage]);

  // Fetch reciters, juzs, hizbs once
  useEffect(() => {
    fetchReciters()
      .then((res) => setReciters(res.reciters ?? []))
      .catch(() => null);
    fetchJuzs()
      .then((res) => {
        const seen = new Set<number>();
        setJuzs((res.juzs ?? []).filter((j) => !seen.has(j.juz_number) && seen.add(j.juz_number)));
      })
      .catch(() => null);
    fetchHizbs()
      .then((res) => {
        const seen = new Set<number>();
        setHizbs(
          (res.hizbs ?? []).filter((h) => !seen.has(h.hizb_number) && seen.add(h.hizb_number))
        );
      })
      .catch(() => null);
  }, []);

  const navigateToVerseKey = async (verseKey: string) => {
    setNavigating(true);
    try {
      const p = await fetchPageForVerseKey(verseKey);
      if (p) goTo(p);
    } finally {
      setNavigating(false);
    }
  };

  // Load page verses + fonts
  useEffect(() => {
    setLoading(true);
    setFontReady(false);
    setVerses([]);
    setIsPlaying(false);
    setCurrentVerseKey(null);

    fetchVersesByPage(page)
      .then(async (res) => {
        const pageVerses = res.verses ?? [];
        setVerses(pageVerses);
        const pageNums = new Set<number>();
        for (const v of pageVerses) {
          for (const w of v.words) pageNums.add(w.page_number);
        }
        await Promise.all(Array.from(pageNums).map(loadQcfPageFont));
        await loadIndopakFont();
        setFontReady(true);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [page]);

  // Update chapter name + fetch names for all surahs on this page
  useEffect(() => {
    if (verses.length === 0) return;
    const ids = [
      ...new Set(verses.map((v) => v.chapter_id || parseInt(v.verse_key.split(':')[0], 10)))
    ];
    Promise.all(ids.map((id) => fetchChapter(id).catch(() => null))).then((results) => {
      const map: Record<number, { arabic: string; simple: string }> = {};
      for (const res of results) {
        if (res?.chapter) {
          map[res.chapter.id] = {
            arabic: res.chapter.name_arabic,
            simple: res.chapter.name_simple
          };
        }
      }
      setChapterNames(map);
      const first = results[0]?.chapter;
      if (first) setCurrentChapterName(first.name_simple ?? chapterName);
    });
  }, [verses, chapterName]);

  // Fetch audio separately — re-runs when page verses load OR reciter changes
  useEffect(() => {
    if (verses.length === 0) return;
    setAudioFiles([]);
    setLoadingAudio(true);
    const surahNums = [
      ...new Set(verses.map((v) => v.chapter_id || parseInt(v.verse_key.split(':')[0], 10)))
    ].filter(Boolean);
    Promise.all(surahNums.map((s) => fetchVerseAudioFiles(selectedReciterId, s).catch(() => [])))
      .then((all) => {
        const pageVerseKeys = new Set(verses.map((v) => v.verse_key));
        setAudioFiles(all.flat().filter((a) => pageVerseKeys.has(a.verse_key)));
      })
      .catch(() => null)
      .finally(() => setLoadingAudio(false));
  }, [verses, selectedReciterId]);

  // Sync audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    const file = audioFiles.find((a) => a.verse_key === currentVerseKey);
    if (!file) {
      audio.pause();
      return;
    }
    if (audio.src !== file.url) {
      audio.src = file.url;
      audio.load();
      if (isPlaying) {
        // Wait for canplay before playing after a src change
        const onCanPlay = () => {
          audio.play().catch(() => setIsPlaying(false));
          audio.removeEventListener('canplay', onCanPlay);
        };
        audio.addEventListener('canplay', onCanPlay);
      }
      return;
    }
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [isPlaying, isMuted, currentVerseKey, audioFiles]);

  const playVerse = (verseKey: string) => {
    setCurrentVerseKey(verseKey);
    setActiveVerseKey(verseKey);
    setIsPlaying(true);
  };

  const handleVerseEnd = () => {
    // Auto-advance to next verse on page
    const idx = audioFiles.findIndex((a) => a.verse_key === currentVerseKey);
    if (idx >= 0 && idx < audioFiles.length - 1) {
      const next = audioFiles[idx + 1].verse_key;
      setCurrentVerseKey(next);
      setActiveVerseKey(next);
    } else {
      setIsPlaying(false);
    }
  };

  const skipPrev = () => {
    const idx = audioFiles.findIndex((a) => a.verse_key === currentVerseKey);
    if (idx > 0) {
      const k = audioFiles[idx - 1].verse_key;
      setCurrentVerseKey(k);
      setActiveVerseKey(k);
    }
  };

  const skipNext = () => {
    const idx = audioFiles.findIndex((a) => a.verse_key === currentVerseKey);
    if (idx >= 0 && idx < audioFiles.length - 1) {
      const k = audioFiles[idx + 1].verse_key;
      setCurrentVerseKey(k);
      setActiveVerseKey(k);
    }
  };

  // Swipe
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) goTo(dx > 0 ? page - 1 : page + 1);
    touchStartX.current = null;
  };

  const sortedLines = Array.from(groupByLine(verses).entries()).sort((a, b) => a[0] - b[0]);

  // Map: line number → chapterId — only the FIRST line where a new surah's verse 1 appears.
  // A single verse can span multiple lines, so we track which chapters already got a banner.
  const surahBannerLines = new Map<number, number>();
  const banneredChapters = new Set<number>();
  for (const [lineNum, words] of sortedLines) {
    for (const word of words) {
      if (word.verseNumber !== 1) continue;
      const chapterId = parseInt(word.verseKey.split(':')[0], 10);
      if (banneredChapters.has(chapterId)) continue;
      // Skip the very first surah that opens page 1 (Al-Fatiha already has no prior content)
      if (lineNum === sortedLines[0]?.[0] && page === 1) {
        banneredChapters.add(chapterId);
        continue;
      }
      surahBannerLines.set(lineNum, chapterId);
      banneredChapters.add(chapterId);
      break;
    }
  }
  const themeConfig = THEME_OPTIONS.find((t) => t.id === theme)!;

  const fontSizeMap = { sm: '1.5rem', md: '1.85rem', lg: '2.25rem' };
  const lineHeightMap = { sm: '2.4', md: '2.7', lg: '3.1' };
  const indopakFontSizeMap = { sm: '1.8rem', md: '2.2rem', lg: '2.8rem' };

  const getWordStyle = (word: LineWord): React.CSSProperties => {
    const isEnd = word.char_type_name === 'end';
    if (font === 'qcf_v2') {
      return {
        fontFamily: `QCFPage${word.page_number}, 'UthmanicHafs', serif`,
        fontSize: fontSizeMap[fontSize]
      };
    }
    if (font === 'indopak') {
      return {
        fontFamily: isEnd ? "'UthmanicHafs', serif" : "'IndoPakNastaleeq', 'UthmanicHafs', serif",
        fontSize: fontSizeMap[fontSize]
      };
    }
    return {
      fontFamily: "'UthmanicHafs', serif",
      fontSize: fontSizeMap[fontSize]
    };
  };

  const getWordText = (word: LineWord): string => {
    if (font === 'qcf_v2' && fontReady) return word.code_v2 || word.text_qpc_hafs;
    if (word.char_type_name === 'end') {
      // Render verse number in an ornate circle for non-QCF fonts
      const num = word.text_qpc_hafs; // Arabic numeral e.g. ١
      return `<span style="display:inline-flex;align-items:center;justify-content:center;width:1.6em;height:1.6em;border-radius:50%;border:1.5px solid currentColor;font-size:0.6em;line-height:1;margin:0 0.15em;vertical-align:middle;font-family:'UthmanicHafs',serif">${num}</span>`;
    }
    if (font === 'indopak') return word.text_indopak || word.text_uthmani || word.text_qpc_hafs;
    return word.text_qpc_hafs || word.text_uthmani;
  };

  const currentIdx = audioFiles.findIndex((a) => a.verse_key === currentVerseKey);

  const SidebarContent = () => (
    <div className="flex flex-col gap-3">
      {/* Navigate */}
      {(juzs.length > 0 || hizbs.length > 0) && (
        <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Navigate
          </p>
          {juzs.length > 0 && (
            <select
              value={selectedJuz}
              onChange={(e) => {
                if (!e.target.value) return;
                const num = Number(e.target.value);
                setSelectedJuz(num);
                setSelectedHizb('');
                const juz = juzs.find((j) => j.juz_number === num);
                if (!juz) return;
                const firstEntry = Object.entries(juz.verse_mapping)[0];
                if (firstEntry)
                  navigateToVerseKey(`${firstEntry[0]}:${firstEntry[1].split('-')[0]}`);
                setSidebarOpen(false);
              }}
              disabled={navigating}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              <option value="" disabled>
                Jump to Juz…
              </option>
              {juzs.map((j) => (
                <option key={j.juz_number} value={j.juz_number}>
                  Juz {j.juz_number}
                </option>
              ))}
            </select>
          )}
          {hizbs.length > 0 && (
            <select
              value={selectedHizb}
              onChange={(e) => {
                if (!e.target.value) return;
                const num = Number(e.target.value);
                setSelectedHizb(num);
                setSelectedJuz('');
                const hizb = hizbs.find((h) => h.hizb_number === num);
                if (!hizb) return;
                const firstEntry = Object.entries(hizb.verse_mapping)[0];
                if (firstEntry)
                  navigateToVerseKey(`${firstEntry[0]}:${firstEntry[1].split('-')[0]}`);
                setSidebarOpen(false);
              }}
              disabled={navigating}
              className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            >
              <option value="" disabled>
                Jump to Hizb…
              </option>
              {hizbs.map((h) => (
                <option key={h.hizb_number} value={h.hizb_number}>
                  Hizb {h.hizb_number}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Audio player */}
      <div className="rounded-2xl border border-border bg-card p-3 space-y-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Audio
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground tabular-nums">
            {currentVerseKey ?? '—'}
          </span>
          {loadingAudio && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={skipPrev}
            disabled={currentIdx <= 0}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (!currentVerseKey && audioFiles.length > 0) playVerse(audioFiles[0].verse_key);
              else setIsPlaying((p) => !p);
            }}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 translate-x-px" />
            )}
          </button>
          <button
            onClick={skipNext}
            disabled={currentIdx >= audioFiles.length - 1}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
        {reciters.length > 0 && (
          <select
            value={selectedReciterId}
            onChange={(e) => {
              setSelectedReciterId(Number(e.target.value));
              setIsPlaying(false);
              setCurrentVerseKey(null);
              setActiveVerseKey(null);
              setSidebarOpen(false);
            }}
            className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {reciters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Script */}
      <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Script
        </p>
        <div className="flex flex-col gap-1.5">
          {FONT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFont(opt.id)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-colors',
                font === opt.id
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
              )}
            >
              <span
                className="text-base leading-none shrink-0"
                style={{
                  fontFamily:
                    opt.id === 'indopak' ? "'IndoPakNastaleeq', serif" : "'UthmanicHafs', serif"
                }}
              >
                {opt.sampleText}
              </span>
              <span className="text-[10px] font-semibold leading-tight">{opt.label}</span>
              {font === opt.id && <Check className="w-3 h-3 text-primary ml-auto shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Theme
        </p>
        <div className="flex flex-col gap-1.5">
          {THEME_OPTIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                'flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-colors',
                theme === t.id ? 'border-primary' : 'border-transparent'
              )}
              style={{ background: t.bg, color: t.text }}
            >
              {theme === t.id && <Check className="w-3 h-3 shrink-0" />}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="rounded-2xl border border-border bg-card p-3 space-y-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Size
        </p>
        <div className="flex flex-col gap-1.5">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              className={cn(
                'px-2.5 py-1.5 rounded-xl border text-xs font-semibold text-left transition-colors',
                fontSize === s
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 items-start select-none w-full relative">
      {/* ── Mushaf page column ─────────────────────────────────── */}
      <div className="flex flex-col items-center flex-1 min-w-0">
        {/* Page label + mobile toggle */}
        <div className="w-full flex items-center justify-between px-1 py-1.5 mb-2">
          <span className="text-xs text-muted-foreground font-medium">
            {currentChapterName ?? ''}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              صفحة {page}
            </span>
            {/* Mobile-only toggle button */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className={cn(
                'lg:hidden p-1.5 rounded-lg transition-colors',
                sidebarOpen
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mushaf page — arrows overlaid on hover */}
        <div className="relative w-full group/page">
          {/* Prev arrow */}
          <button
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-background border border-border shadow flex items-center justify-center text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover/page:opacity-100 disabled:opacity-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Next arrow */}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page >= TOTAL_PAGES}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-9 h-9 rounded-full bg-background border border-border shadow flex items-center justify-center text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover/page:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full rounded-2xl shadow-md overflow-y-auto relative"
            style={{
              background: themeConfig.bg,
              border: `1px solid ${themeConfig.border}`,
              aspectRatio: '1 / 1.41'
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full absolute inset-0">
                <Loader2
                  className="w-6 h-6 animate-spin"
                  style={{ color: themeConfig.text, opacity: 0.4 }}
                />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${page}-${font}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-full flex flex-col justify-center px-4 py-6"
                  dir="rtl"
                >
                  {sortedLines.map(([lineNum, words]) => {
                    const bannerChapterId = surahBannerLines.get(lineNum);
                    const bannerInfo = bannerChapterId ? chapterNames[bannerChapterId] : null;
                    // golden tint that works across all three themes
                    const gold =
                      theme === 'dark' ? 'rgba(180,140,60,0.55)' : 'rgba(120,90,30,0.25)';
                    const goldText = theme === 'dark' ? '#c8a84b' : '#7a5c1e';
                    return (
                      <div key={lineNum}>
                        {bannerInfo && (
                          <div
                            className="my-2 mx-1 flex items-center justify-center"
                            dir="rtl"
                            style={{
                              border: `1.5px solid ${gold}`,
                              borderRadius: '6px',
                              padding: '4px 12px',
                              background:
                                theme === 'dark' ? 'rgba(180,140,60,0.08)' : 'rgba(120,90,30,0.06)',
                              position: 'relative'
                            }}
                          >
                            {/* corner ornaments */}
                            {[
                              'top-0 right-0',
                              'top-0 left-0',
                              'bottom-0 right-0',
                              'bottom-0 left-0'
                            ].map((pos) => (
                              <span
                                key={pos}
                                className={`absolute ${pos} w-2 h-2 rounded-sm`}
                                style={{ background: gold, margin: '-1px' }}
                              />
                            ))}
                            <span
                              style={{
                                fontFamily: "'UthmanicHafs', 'Amiri', serif",
                                fontSize: '0.95rem',
                                color: goldText,
                                letterSpacing: '0.04em',
                                fontWeight: 600
                              }}
                            >
                              سُورَةُ {bannerInfo.arabic}
                            </span>
                          </div>
                        )}
                        <div
                          className="flex justify-center items-baseline flex-wrap"
                          style={{ lineHeight: lineHeightMap[fontSize] }}
                        >
                          {words.map((word, wi) => (
                            <span
                              key={`${word.verseKey}-${word.position}-${wi}`}
                              onClick={() => {
                                if (activeVerseKey === word.verseKey) setIsPlaying((p) => !p);
                                else playVerse(word.verseKey);
                              }}
                              className="cursor-pointer transition-colors duration-150 px-px"
                              style={{
                                ...getWordStyle(word),
                                color:
                                  activeVerseKey === word.verseKey ? '#16a34a' : themeConfig.text
                              }}
                              dangerouslySetInnerHTML={{ __html: getWordText(word) }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {verses.length === 0 && (
                    <p
                      className="text-center py-12 text-sm"
                      style={{ color: themeConfig.text, opacity: 0.5 }}
                    >
                      No content found for this page.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
        {/* end group/page wrapper */}

        {/* Page counter */}
        <span className="mt-3 text-xs text-muted-foreground tabular-nums">
          {page} / {TOTAL_PAGES}
        </span>
      </div>

      {/* ── Desktop sidebar (lg+) — always visible ─────────────── */}
      <div className="hidden lg:flex w-52 shrink-0 flex-col gap-3 sticky top-4">
        <SidebarContent />
      </div>

      {/* ── Mobile: backdrop + slide-in drawer ──────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full z-50 w-64 bg-background border-l border-border overflow-y-auto p-4 lg:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-foreground">Settings</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('select') === null) setSidebarOpen(false);
                }}
              >
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleVerseEnd} onError={() => setIsPlaying(false)} />
    </div>
  );
}
