// ─── Quran Garden — XP & Progression Engine ──────────────────────────────────
// All garden state is persisted in localStorage so it survives page reloads.
// The engine is intentionally framework-agnostic so it can be called from
// anywhere in the app (quran-reader, reflections, notes, guidance, etc.)

export type GardenAction =
  | 'read_verse' // 1 verse read in translation mode
  | 'read_page' // 1 mushaf page viewed
  | 'read_tafsir' // tafsir expanded for a verse
  | 'listen_verse' // audio played for a verse
  | 'write_note' // note saved
  | 'write_reflection' // reflection/post written
  | 'seek_guidance' // AI guidance query submitted
  | 'join_circle' // joined a recitation circle
  | 'complete_goal' // a daily goal completed
  | 'share_verse' // verse shared
  | 'streak_day'; // daily streak maintained (called once per day)

export interface GardenState {
  totalXP: number;
  weeklyXP: number;
  weekStart: string; // ISO date string of the Monday this week started
  level: number; // 1–20
  stage: 1 | 2 | 3 | 4; // garden visual stage
  streakDays: number;
  lastActivityDate: string; // ISO date string
  actionCounts: Record<GardenAction, number>;
  unlockedElements: string[];
  lastXPGain: { amount: number; action: GardenAction; ts: number } | null;
}

// ─── XP table ─────────────────────────────────────────────────────────────────
const XP_TABLE: Record<GardenAction, number> = {
  read_verse: 2,
  read_page: 8,
  read_tafsir: 5,
  listen_verse: 3,
  write_note: 10,
  write_reflection: 20,
  seek_guidance: 8,
  join_circle: 25,
  complete_goal: 30,
  share_verse: 5,
  streak_day: 15
};

// ─── Level thresholds (XP needed to reach each level) ────────────────────────
const LEVEL_THRESHOLDS = [
  0, 50, 120, 220, 350, 520, 730, 990, 1300, 1670, 2100, 2600, 3180, 3840, 4590, 5440, 6400, 7480,
  8690, 10000
];

// ─── Stage thresholds (total XP) ─────────────────────────────────────────────
const STAGE_THRESHOLDS: [number, 1 | 2 | 3 | 4][] = [
  [0, 1],
  [200, 2],
  [800, 3],
  [2500, 4]
];

// ─── Unlockable garden elements ───────────────────────────────────────────────
const UNLOCK_RULES: { id: string; condition: (s: GardenState) => boolean }[] = [
  { id: 'small_flowers', condition: (s) => s.totalXP >= 50 },
  { id: 'rich_grass', condition: (s) => s.totalXP >= 100 },
  { id: 'first_tree', condition: (s) => s.totalXP >= 200 },
  { id: 'pathway', condition: (s) => s.totalXP >= 300 },
  { id: 'stream', condition: (s) => s.totalXP >= 500 },
  { id: 'birds', condition: (s) => s.totalXP >= 700 },
  { id: 'wisdom_tree', condition: (s) => s.actionCounts.read_tafsir >= 10 },
  { id: 'reflection_pool', condition: (s) => s.actionCounts.write_reflection >= 5 },
  { id: 'fruit_tree', condition: (s) => s.totalXP >= 1200 },
  { id: 'glow_path', condition: (s) => s.totalXP >= 1800 },
  { id: 'rare_flowers', condition: (s) => s.actionCounts.write_reflection >= 20 },
  { id: 'circle_grove', condition: (s) => s.actionCounts.join_circle >= 3 },
  { id: 'waterfall', condition: (s) => s.totalXP >= 3000 },
  { id: 'golden_light', condition: (s) => s.totalXP >= 5000 }
];

// ─── Storage key ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'hidaayah_garden_v1';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMondayISO(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function computeLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 20);
}

function computeStage(xp: number): 1 | 2 | 3 | 4 {
  let stage: 1 | 2 | 3 | 4 = 1;
  for (const [threshold, s] of STAGE_THRESHOLDS) {
    if (xp >= threshold) stage = s;
  }
  return stage;
}

function computeUnlocks(state: GardenState): string[] {
  const unlocked = new Set(state.unlockedElements);
  for (const rule of UNLOCK_RULES) {
    if (rule.condition(state)) unlocked.add(rule.id);
  }
  return Array.from(unlocked);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function loadGarden(): GardenState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as GardenState;
    // Reset weekly XP if we're in a new week
    if (parsed.weekStart !== getMondayISO()) {
      parsed.weeklyXP = 0;
      parsed.weekStart = getMondayISO();
    }
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveGarden(state: GardenState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function awardXP(action: GardenAction, multiplier = 1): GardenState {
  const state = loadGarden();
  const base = XP_TABLE[action];
  const streakBonus = state.streakDays >= 7 ? 1.2 : state.streakDays >= 3 ? 1.1 : 1;
  const xp = Math.round(base * multiplier * streakBonus);

  const today = todayISO();
  const monday = getMondayISO();

  const newState: GardenState = {
    ...state,
    totalXP: state.totalXP + xp,
    weeklyXP: (state.weekStart === monday ? state.weeklyXP : 0) + xp,
    weekStart: monday,
    lastActivityDate: today,
    actionCounts: {
      ...state.actionCounts,
      [action]: (state.actionCounts[action] ?? 0) + 1
    },
    lastXPGain: { amount: xp, action, ts: Date.now() }
  };

  newState.level = computeLevel(newState.totalXP);
  newState.stage = computeStage(newState.totalXP);
  newState.unlockedElements = computeUnlocks(newState);

  saveGarden(newState);

  // Dispatch a custom event so any mounted garden component can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('garden:xp', { detail: { xp, action } }));
  }

  return newState;
}

export function getXPForNextLevel(state: GardenState): {
  current: number;
  needed: number;
  pct: number;
} {
  const idx = state.level - 1;
  const current = state.totalXP - LEVEL_THRESHOLDS[idx];
  const needed =
    (LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) -
    LEVEL_THRESHOLDS[idx];
  return { current, needed, pct: Math.min(100, Math.round((current / needed) * 100)) };
}

export function getVitalityPct(state: GardenState): number {
  // Vitality decays if no activity for > 2 days, recovers with engagement
  const today = new Date();
  const last = new Date(state.lastActivityDate || todayISO());
  const daysSince = Math.floor((today.getTime() - last.getTime()) / 86_400_000);
  const decay = Math.max(0, (daysSince - 2) * 8);
  return Math.max(20, Math.min(100, 100 - decay));
}

function defaultState(): GardenState {
  return {
    totalXP: 0,
    weeklyXP: 0,
    weekStart: getMondayISO(),
    level: 1,
    stage: 1,
    streakDays: 0,
    lastActivityDate: todayISO(),
    actionCounts: {
      read_verse: 0,
      read_page: 0,
      read_tafsir: 0,
      listen_verse: 0,
      write_note: 0,
      write_reflection: 0,
      seek_guidance: 0,
      join_circle: 0,
      complete_goal: 0,
      share_verse: 0,
      streak_day: 0
    },
    unlockedElements: [],
    lastXPGain: null
  };
}
