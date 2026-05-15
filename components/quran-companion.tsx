'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, BookOpen, ChevronDown, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseIntent, resolveIntent } from '@/lib/companion-engine';
import type { CompanionResponse } from '@/lib/companion-engine';
import { useRouter, usePathname } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  nav?: QuranNavEvent;
  navLabel?: string;
  error?: boolean;
}

const SUGGESTIONS = [
  'Show me Ayat al-Kursi (2:255)',
  'Tell me about Surah Al-Kahf',
  'Find verses about patience',
  'Tafsir of Surah Ad-Duha (93:1)',
  "What's in Juz 30?",
  'Find reciter Mishari Alafasy',
  'Play reciter Sudais',
  'Surprise me with a random ayah'
];

// Matches runs of Arabic characters (including diacritics and punctuation)
const ARABIC_SEGMENT_RE = /([؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿][؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿ً-ٟ\s]*)/g;

function stripHtmlTags(s: string): string {
  return s
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .trim();
}

function isArabicLine(text: string): boolean {
  const arabicChars = (text.match(/[؀-ۿ]/g) ?? []).length;
  return arabicChars > text.length * 0.3;
}

// Split text into alternating english/arabic segments so Arabic is never inline
type Segment = { type: 'english'; text: string } | { type: 'arabic'; text: string };

function splitIntoSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(ARABIC_SEGMENT_RE.source, 'g');

  while ((match = re.exec(text)) !== null) {
    const arabicText = match[0].trim();
    if (!arabicText) continue;
    if (match.index > lastIndex) {
      const eng = text.slice(lastIndex, match.index).trim();
      if (eng) segments.push({ type: 'english', text: eng });
    }
    segments.push({ type: 'arabic', text: arabicText });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    const eng = text.slice(lastIndex).trim();
    if (eng) segments.push({ type: 'english', text: eng });
  }
  return segments;
}

// Render bold/italic within an English string
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**'))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </>
  );
}

// Render a full message — Arabic segments are always on their own line
function renderMessage(raw: string): React.ReactNode {
  const text = stripHtmlTags(raw);
  if (!text) return null;

  const nodes: React.ReactNode[] = [];
  let nodeKey = 0;

  text.split('\n').forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      nodes.push(<div key={nodeKey++} className="h-2" />);
      return;
    }

    // Pure Arabic line — render as clean RTL block
    if (isArabicLine(trimmed)) {
      nodes.push(
        <p
          key={nodeKey++}
          dir="rtl"
          lang="ar"
          style={{
            fontFamily: 'var(--font-arabic, serif)',
            fontSize: '1.18em',
            lineHeight: 2.3,
            wordBreak: 'normal',
            overflowWrap: 'break-word'
          }}
          className="text-right text-foreground my-1 w-full"
        >
          {trimmed}
        </p>
      );
      return;
    }

    // Mixed line — split Arabic out onto its own line above/below
    const segments = splitIntoSegments(trimmed);
    if (segments.every((s) => s.type === 'english')) {
      nodes.push(
        <p key={nodeKey++} className="leading-relaxed whitespace-pre-wrap">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
      return;
    }

    segments.forEach((seg) => {
      if (seg.type === 'arabic') {
        nodes.push(
          <p
            key={nodeKey++}
            dir="rtl"
            lang="ar"
            style={{
              fontFamily: 'var(--font-arabic, serif)',
              fontSize: '1.18em',
              lineHeight: 2.3,
              wordBreak: 'normal',
              overflowWrap: 'break-word'
            }}
            className="text-right text-foreground my-1 w-full"
          >
            {seg.text}
          </p>
        );
      } else {
        nodes.push(
          <p key={nodeKey++} className="leading-relaxed whitespace-pre-wrap">
            {renderInlineMarkdown(seg.text)}
          </p>
        );
      }
    });
  });

  return <>{nodes}</>;
}

export type QuranNavEvent = {
  verseKey?: string;
  chapterNumber?: number;
  juzNumber?: number;
  hizbNumber?: number;
  pageNumber?: number;
  reciterName?: string;
  mode?: 'translation' | 'mushaf';
};

export const QURAN_NAV_EVENT = 'quran-companion-navigate';

function buildNavigation(
  response: CompanionResponse
): { nav: QuranNavEvent; label: string } | undefined {
  if (response.verseKey) {
    return {
      nav: { verseKey: response.verseKey, mode: 'translation' },
      label: 'Open in reader →'
    };
  }
  if (response.chapterNumber) {
    return {
      nav: { chapterNumber: response.chapterNumber, mode: 'translation' },
      label: 'Read surah →'
    };
  }
  if (response.juzNumber) {
    return {
      nav: { juzNumber: response.juzNumber },
      label: `Open Juz ${response.juzNumber} →`
    };
  }
  if (response.hizbNumber) {
    return {
      nav: { hizbNumber: response.hizbNumber },
      label: `Open Hizb ${response.hizbNumber} →`
    };
  }
  if (response.pageNumber) {
    return {
      nav: { pageNumber: response.pageNumber },
      label: `Open page ${response.pageNumber} →`
    };
  }
  if (response.reciterName) {
    return {
      nav: { reciterName: response.reciterName },
      label: `Find ${response.reciterName} in Reciters →`
    };
  }
  return undefined;
}

function navToHref(nav: QuranNavEvent): string {
  if (nav.verseKey) return `/dashboard/quran?verse=${nav.verseKey}&mode=translation`;
  if (nav.chapterNumber) return `/dashboard/quran?surah=${nav.chapterNumber}&mode=translation`;
  if (nav.juzNumber) return `/dashboard/quran?format=juz&juz=${nav.juzNumber}`;
  if (nav.hizbNumber) return `/dashboard/quran?format=hizb&hizb=${nav.hizbNumber}`;
  if (nav.pageNumber) return `/dashboard/quran?format=page&page=${nav.pageNumber}`;
  if (nav.reciterName)
    return `/dashboard/quran?format=reciters&reciter=${encodeURIComponent(nav.reciterName)}`;
  return '/dashboard/quran';
}

function MessageBubble({
  msg,
  onNavigate
}: {
  msg: Message;
  onNavigate: (nav: QuranNavEvent) => void;
}) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-linear-to-br from-primary to-teal flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className="flex flex-col gap-1.5 max-w-[82%]">
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : msg.error
                ? 'bg-destructive/10 border border-destructive/30 text-foreground rounded-tl-sm'
                : 'bg-card border border-border text-foreground rounded-tl-sm'
          )}
        >
          {isUser ? msg.text : <div className="space-y-1">{renderMessage(msg.text)}</div>}
        </div>
        {msg.nav && msg.navLabel && (
          <button
            onClick={() => onNavigate(msg.nav!)}
            className="self-start flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            {msg.navLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function QuranCompanion() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const handleNavigate = useCallback(
    (nav: QuranNavEvent) => {
      const onQuranPage = pathname === '/dashboard/quran';
      if (onQuranPage) {
        // Dispatch event so the already-mounted quran page handles it directly
        window.dispatchEvent(new CustomEvent(QURAN_NAV_EVENT, { detail: nav }));
        setOpen(false);
      } else {
        router.push(navToHref(nav));
        setOpen(false);
      }
    },
    [pathname, router]
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        text: trimmed
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

      try {
        const intent = parseIntent(trimmed);
        const response = await resolveIntent(intent);
        const navigation = buildNavigation(response);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: response.text,
            nav: navigation?.nav,
            navLabel: navigation?.label
          }
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            text: `Sorry, I couldn't fetch that from the Quran Foundation API. Please try again.${err instanceof Error ? `\n\n*${err.message}*` : ''}`,
            error: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const isEmpty = messages.length === 0;
  const assistantCount = messages.filter((m) => m.role === 'assistant').length;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setOpen(true)}
            aria-label="Open Quran Companion"
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-teal text-white shadow-lg shadow-primary/25 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6" />
            {assistantCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
                {assistantCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-100 h-[88vh] md:h-155 flex flex-col bg-background md:rounded-3xl border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-card shrink-0">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-teal flex items-center justify-center shadow-sm shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">Quran Companion</p>
                <p className="text-[10px] text-muted-foreground">Powered by QF APIs</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    aria-label="New chat"
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    New Chat
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Minimise companion"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors hidden md:flex"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close companion"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
                  <div className="space-y-2">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/15 to-teal/15 flex items-center justify-center mx-auto">
                      <BookOpen className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-base font-serif font-bold text-foreground">
                      Ask anything about the Quran
                    </p>
                    <p className="text-xs text-muted-foreground max-w-65">
                      I fetch live data from the Quran Foundation API — verses, tafsir, surah info,
                      topic search and more.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-left px-3.5 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors text-xs text-foreground/80 font-medium"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} onNavigate={handleNavigate} />
                  ))}
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2.5"
                    >
                      <div className="w-7 h-7 rounded-xl bg-linear-to-br from-primary to-teal flex items-center justify-center shrink-0 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Fetching from QF API…</span>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-border bg-card shrink-0">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about a verse, surah, tafsir, or topic…"
                  rows={1}
                  disabled={loading}
                  className="flex-1 resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow disabled:opacity-60 max-h-30 leading-relaxed"
                />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => send(input)}
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
