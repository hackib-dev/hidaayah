'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGarden, getXPForNextLevel, getVitalityPct } from '@/lib/garden';
import type { GardenState } from '@/lib/garden';
import { Sparkles, Leaf, Droplets, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── XP Toast ─────────────────────────────────────────────────────────────────
function XPToast({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.9 }}
      className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 pointer-events-none"
    >
      <Sparkles className="w-4 h-4" />+{xp} XP
    </motion.div>
  );
}

// ─── Floating particles ───────────────────────────────────────────────────────
function Particle({ x, delay, color }: { x: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute bottom-0 rounded-full pointer-events-none"
      style={{ left: `${x}%`, width: 6, height: 6, background: color }}
      animate={{ y: [-0, -60, -120], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.3] }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

// ─── SVG Garden Scene ─────────────────────────────────────────────────────────
function GardenScene({ state, vitality }: { state: GardenState; vitality: number }) {
  const { stage, unlockedElements: u } = state;
  const dim = vitality < 50;

  // Sky gradient based on stage + vitality
  const skyColors =
    stage === 4
      ? ['#fef3c7', '#d1fae5']
      : stage === 3
        ? ['#e0f2fe', '#dcfce7']
        : stage === 2
          ? ['#f0fdf4', '#ecfdf5']
          : ['#f8fafc', '#f0fdf4'];

  return (
    <svg
      viewBox="0 0 800 420"
      className="w-full h-full"
      style={{
        filter: dim ? 'saturate(0.5) brightness(0.85)' : 'none',
        transition: 'filter 1.5s ease'
      }}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyColors[0]} />
          <stop offset="100%" stopColor={skyColors[1]} />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={stage >= 3 ? '#4ade80' : stage >= 2 ? '#86efac' : '#bbf7d0'}
          />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
        </radialGradient>
        <filter id="soft-blur">
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="800" height="420" fill="url(#sky)" />

      {/* Sun / golden light */}
      {stage >= 2 && (
        <motion.circle
          cx="680"
          cy="60"
          r={stage >= 4 ? 38 : 28}
          fill={stage >= 4 ? '#fde68a' : '#fef9c3'}
          animate={{ r: [stage >= 4 ? 38 : 28, stage >= 4 ? 42 : 31, stage >= 4 ? 38 : 28] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {u.includes('golden_light') && <ellipse cx="680" cy="60" rx="80" ry="80" fill="url(#glow)" />}

      {/* Distant hills */}
      {stage >= 2 && (
        <>
          <ellipse
            cx="150"
            cy="280"
            rx="200"
            ry="80"
            fill={stage >= 3 ? '#86efac' : '#bbf7d0'}
            opacity="0.5"
          />
          <ellipse
            cx="650"
            cy="290"
            rx="180"
            ry="70"
            fill={stage >= 3 ? '#86efac' : '#bbf7d0'}
            opacity="0.4"
          />
        </>
      )}

      {/* Ground */}
      <rect x="0" y="300" width="800" height="120" fill="url(#ground)" />

      {/* Rich grass blades */}
      {u.includes('rich_grass') &&
        Array.from({ length: 30 }).map((_, i) => (
          <motion.line
            key={i}
            x1={20 + i * 26}
            y1="300"
            x2={20 + i * 26 + (i % 3 === 0 ? 4 : -4)}
            y2={285 - (i % 4) * 3}
            stroke="#22c55e"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={{
              x2: [
                20 + i * 26 + (i % 3 === 0 ? 4 : -4),
                20 + i * 26 + (i % 3 === 0 ? -3 : 3),
                20 + i * 26 + (i % 3 === 0 ? 4 : -4)
              ]
            }}
            transition={{
              duration: 2 + (i % 3) * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.07
            }}
          />
        ))}

      {/* Pathway */}
      {u.includes('pathway') && (
        <>
          <ellipse cx="400" cy="380" rx="60" ry="18" fill="#d97706" opacity="0.3" />
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse
              key={i}
              cx="400"
              cy={370 - i * 18}
              rx={55 - i * 4}
              ry="8"
              fill={u.includes('glow_path') ? '#fef08a' : '#fde68a'}
              opacity={u.includes('glow_path') ? 0.5 : 0.25}
            />
          ))}
        </>
      )}

      {/* Stream / water */}
      {u.includes('stream') && (
        <motion.path
          d="M 0 340 Q 100 330 200 345 Q 300 355 400 340 Q 500 325 600 338 Q 700 348 800 335"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.7"
          animate={{
            d: [
              'M 0 340 Q 100 330 200 345 Q 300 355 400 340 Q 500 325 600 338 Q 700 348 800 335',
              'M 0 342 Q 100 335 200 342 Q 300 350 400 342 Q 500 330 600 342 Q 700 345 800 338',
              'M 0 340 Q 100 330 200 345 Q 300 355 400 340 Q 500 325 600 338 Q 700 348 800 335'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Waterfall */}
      {u.includes('waterfall') && (
        <>
          <rect x="60" y="240" width="18" height="60" fill="#7dd3fc" opacity="0.6" rx="4" />
          <motion.rect
            x="60"
            y="240"
            width="18"
            height="60"
            fill="#bae6fd"
            opacity="0.4"
            rx="4"
            animate={{ y: [240, 244, 240] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <ellipse cx="69" cy="305" rx="22" ry="8" fill="#7dd3fc" opacity="0.4" />
        </>
      )}

      {/* Small flowers — stage 2+ */}
      {u.includes('small_flowers') &&
        [
          { x: 80, y: 295, c: '#f9a8d4' },
          { x: 160, y: 292, c: '#fde68a' },
          { x: 580, y: 294, c: '#a5f3fc' },
          { x: 660, y: 291, c: '#f9a8d4' },
          { x: 720, y: 296, c: '#fde68a' }
        ].map((f, i) => (
          <motion.g
            key={i}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
          >
            <circle cx={f.x} cy={f.y} r="7" fill={f.c} opacity="0.9" />
            <circle cx={f.x} cy={f.y} r="3" fill="#fef9c3" />
            <line x1={f.x} y1={f.y + 7} x2={f.x} y2={f.y + 18} stroke="#16a34a" strokeWidth="2" />
          </motion.g>
        ))}

      {/* Rare flowers — reflection unlocked */}
      {u.includes('rare_flowers') &&
        [
          { x: 300, y: 290, c: '#c084fc' },
          { x: 500, y: 288, c: '#fb923c' },
          { x: 240, y: 294, c: '#34d399' }
        ].map((f, i) => (
          <motion.g
            key={i}
            animate={{ y: [0, -5, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
            style={{ transformOrigin: `${f.x}px ${f.y + 14}px` }}
          >
            {[0, 60, 120, 180, 240, 300].map((angle, j) => (
              <ellipse
                key={j}
                cx={f.x + Math.cos((angle * Math.PI) / 180) * 9}
                cy={f.y + Math.sin((angle * Math.PI) / 180) * 9}
                rx="5"
                ry="8"
                fill={f.c}
                opacity="0.85"
                transform={`rotate(${angle}, ${f.x + Math.cos((angle * Math.PI) / 180) * 9}, ${f.y + Math.sin((angle * Math.PI) / 180) * 9})`}
              />
            ))}
            <circle cx={f.x} cy={f.y} r="4" fill="#fef9c3" />
            <line x1={f.x} y1={f.y + 9} x2={f.x} y2={f.y + 22} stroke="#16a34a" strokeWidth="2" />
          </motion.g>
        ))}

      {/* First tree */}
      {u.includes('first_tree') && (
        <motion.g
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '200px 300px' }}
        >
          <rect x="194" y="255" width="12" height="50" fill="#92400e" rx="3" />
          <circle cx="200" cy="240" r="38" fill={stage >= 3 ? '#16a34a' : '#22c55e'} />
          <circle cx="185" cy="250" r="22" fill={stage >= 3 ? '#15803d' : '#16a34a'} />
          <circle cx="215" cy="248" r="20" fill={stage >= 3 ? '#15803d' : '#16a34a'} />
        </motion.g>
      )}

      {/* Wisdom tree */}
      {u.includes('wisdom_tree') && (
        <motion.g
          animate={{ rotate: [-1, 1, -1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '600px 300px' }}
        >
          <rect x="594" y="240" width="12" height="65" fill="#78350f" rx="3" />
          <circle cx="600" cy="220" r="45" fill="#065f46" />
          <circle cx="582" cy="232" r="26" fill="#047857" />
          <circle cx="618" cy="230" r="24" fill="#047857" />
          {/* Glowing knowledge orbs */}
          {[0, 72, 144, 216, 288].map((a, i) => (
            <motion.circle
              key={i}
              cx={600 + Math.cos((a * Math.PI) / 180) * 30}
              cy={220 + Math.sin((a * Math.PI) / 180) * 30}
              r="4"
              fill="#fde68a"
              animate={{ opacity: [0.4, 1, 0.4], r: [3, 5, 3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </motion.g>
      )}

      {/* Fruit tree */}
      {u.includes('fruit_tree') && (
        <motion.g
          animate={{ rotate: [-0.8, 0.8, -0.8] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '400px 300px' }}
        >
          <rect x="394" y="245" width="12" height="58" fill="#92400e" rx="3" />
          <circle cx="400" cy="225" r="50" fill="#15803d" />
          <circle cx="378" cy="238" r="28" fill="#166534" />
          <circle cx="422" cy="236" r="26" fill="#166534" />
          {/* Fruits */}
          {[
            { x: 390, y: 215 },
            { x: 410, y: 220 },
            { x: 398, y: 235 },
            { x: 415, y: 238 },
            { x: 382, y: 230 }
          ].map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="6"
              fill="#ef4444"
              animate={{ cy: [p.y, p.y + 2, p.y] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.g>
      )}

      {/* Reflection pool */}
      {u.includes('reflection_pool') && (
        <>
          <motion.ellipse
            cx="400"
            cy="360"
            rx="70"
            ry="22"
            fill="#7dd3fc"
            opacity="0.5"
            animate={{ rx: [70, 74, 70] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <ellipse
            cx="400"
            cy="360"
            rx="70"
            ry="22"
            fill="none"
            stroke="#bae6fd"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Reflection shimmer */}
          {[0, 1, 2].map((i) => (
            <motion.line
              key={i}
              x1={360 + i * 20}
              y1="358"
              x2={365 + i * 20}
              y2="362"
              stroke="white"
              strokeWidth="1.5"
              opacity="0.6"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </>
      )}

      {/* Circle grove */}
      {u.includes('circle_grove') &&
        [
          { x: 100, y: 270 },
          { x: 130, y: 265 },
          { x: 115, y: 258 }
        ].map((t, i) => (
          <motion.g
            key={i}
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 3 + i, repeat: Infinity }}
            style={{ transformOrigin: `${t.x}px 300px` }}
          >
            <rect x={t.x - 4} y={t.y + 20} width="8" height="35" fill="#92400e" rx="2" />
            <circle cx={t.x} cy={t.y} r="22" fill="#16a34a" />
          </motion.g>
        ))}

      {/* Birds */}
      {u.includes('birds') &&
        [
          { x: 300, y: 80 },
          { x: 340, y: 70 },
          { x: 370, y: 85 }
        ].map((b, i) => (
          <motion.g
            key={i}
            animate={{ x: [0, 30, 60], y: [0, -8, 0] }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5
            }}
          >
            <path
              d={`M ${b.x} ${b.y} Q ${b.x + 6} ${b.y - 5} ${b.x + 12} ${b.y}`}
              fill="none"
              stroke="#374151"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d={`M ${b.x + 12} ${b.y} Q ${b.x + 18} ${b.y - 5} ${b.x + 24} ${b.y}`}
              fill="none"
              stroke="#374151"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </motion.g>
        ))}

      {/* Stage 1 — welcoming empty state */}
      {stage === 1 && state.totalXP < 10 && (
        <>
          <text
            x="400"
            y="185"
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="13"
            fontFamily="Georgia, serif"
            opacity="0.7"
          >
            Begin your Quran journey...
          </text>
          <text
            x="400"
            y="205"
            textAnchor="middle"
            fill="#9ca3af"
            fontSize="11"
            fontFamily="Georgia, serif"
            opacity="0.5"
          >
            Read, reflect, and watch your garden grow
          </text>
        </>
      )}
    </svg>
  );
}

// ─── Main QuranGarden component ───────────────────────────────────────────────
interface QuranGardenProps {
  compact?: boolean; // smaller version for dashboard widget
}

export function QuranGarden({ compact = false }: QuranGardenProps) {
  const [state, setState] = useState<GardenState | null>(null);
  const [toastXP, setToastXP] = useState<number | null>(null);
  const vitality = state ? getVitalityPct(state) : 100;

  useEffect(() => {
    setState(loadGarden());

    const handler = (e: Event) => {
      const { xp } = (e as CustomEvent).detail;
      setState(loadGarden());
      setToastXP(xp);
    };
    window.addEventListener('garden:xp', handler);
    return () => window.removeEventListener('garden:xp', handler);
  }, []);

  if (!state) return null;

  const { level, totalXP, weeklyXP, stage } = state;
  const { pct, current, needed } = getXPForNextLevel(state);

  const stageLabels = [
    'Bare Beginning',
    'Early Growth',
    'Flourishing Garden',
    'Spiritual Sanctuary'
  ];
  const stageColors = ['text-slate-500', 'text-emerald-600', 'text-teal-600', 'text-amber-600'];

  if (compact) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="relative h-32">
          <GardenScene state={state} vitality={vitality} />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
            <div>
              <p className={cn('text-xs font-bold', stageColors[stage - 1])}>
                {stageLabels[stage - 1]}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Level {level} · {totalXP} XP
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">{weeklyXP} XP this week</p>
              <p className="text-[10px] text-emerald-600 font-semibold">View garden →</p>
            </div>
          </div>
        </div>
        {/* XP bar */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground">Level {level}</span>
            <span className="text-[10px] text-muted-foreground">
              {current}/{needed} XP
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Garden canvas */}
      <div className="relative rounded-2xl border border-border overflow-hidden shadow-sm bg-card">
        <div className="relative" style={{ aspectRatio: '800/420' }}>
          <GardenScene state={state} vitality={vitality} />

          {/* Floating particles when vitality is high */}
          {vitality > 70 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[15, 35, 55, 75, 90].map((x, i) => (
                <Particle
                  key={i}
                  x={x}
                  delay={i * 0.8}
                  color={['#86efac', '#fde68a', '#a5f3fc', '#f9a8d4', '#c4b5fd'][i]}
                />
              ))}
            </div>
          )}

          {/* Vitality warning overlay */}
          {vitality < 50 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-border">
                <Leaf className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-sm font-semibold text-foreground">Your garden misses you</p>
                <p className="text-xs text-muted-foreground">Read or reflect to restore it</p>
              </div>
            </div>
          )}

          {/* Stage badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'px-2.5 py-1 rounded-xl text-xs font-bold bg-background/80 backdrop-blur-sm border border-border',
                stageColors[stage - 1]
              )}
            >
              {stageLabels[stage - 1]}
            </span>
          </div>

          {/* Level badge */}
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-background/80 backdrop-blur-sm border border-border text-foreground">
              Level {level}
            </span>
          </div>
        </div>

        {/* Vitality bar */}
        <div className="px-4 py-2 border-t border-border flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-sky-500 shrink-0" />
          <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full',
                vitality > 70 ? 'bg-sky-400' : vitality > 40 ? 'bg-amber-400' : 'bg-rose-400'
              )}
              animate={{ width: `${vitality}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">Vitality {vitality}%</span>
        </div>
      </div>

      {/* XP & Level progress */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">Level {level}</p>
            <p className="text-xs text-muted-foreground">
              {current} / {needed} XP to next level
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-600 font-serif">{totalXP}</p>
            <p className="text-[10px] text-muted-foreground">Total XP</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-500" />
            {weeklyXP} XP this week
          </span>
          <span>
            {pct}% to Level {level + 1}
          </span>
        </div>
      </div>

      {/* Unlocked elements */}
      {state.unlockedElements.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Garden Elements
          </p>
          <div className="flex flex-wrap gap-2">
            {state.unlockedElements.map((el) => (
              <span
                key={el}
                className="px-2.5 py-1 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold capitalize"
              >
                {el.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Action counts */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Your Journey
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['Verses Read', state.actionCounts.read_verse],
              ['Pages Read', state.actionCounts.read_page],
              ['Tafsir Read', state.actionCounts.read_tafsir],
              ['Reflections', state.actionCounts.write_reflection],
              ['Notes Written', state.actionCounts.write_note],
              ['Goals Completed', state.actionCounts.complete_goal]
            ] as [string, number][]
          ).map(([label, count]) => (
            <div
              key={label}
              className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/50"
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-bold text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {toastXP !== null && <XPToast xp={toastXP} onDone={() => setToastXP(null)} />}
      </AnimatePresence>
    </div>
  );
}
