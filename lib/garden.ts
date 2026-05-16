// ─── Quran Garden — XP & Progression Engine ──────────────────────────────────
// Only two actions earn XP: reading a new Mushaf page and reading tafsir.
// Pages are deduplicated via a persisted Set so revisiting a page never re-counts.

export type GardenAction = 'read_page' | 'read_tafsir';

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
  // Persisted set of Mushaf page numbers already counted
  readPages: number[];
}

// ─── XP table ─────────────────────────────────────────────────────────────────
const XP_TABLE: Record<GardenAction, number> = {
  read_page: 10, // each unique page
  read_tafsir: 8 // each tafsir expansion
};

// ─── Level thresholds (XP needed to reach each level) ────────────────────────
const LEVEL_THRESHOLDS = [
  0, 60, 150, 280, 450, 660, 920, 1230, 1600, 2040, 2550, 3140, 3820, 4600, 5490, 6500, 7640, 8920,
  10350, 12000
];

// ─── Stage thresholds (total XP) ─────────────────────────────────────────────
const STAGE_THRESHOLDS: [number, 1 | 2 | 3 | 4][] = [
  [0, 1],
  [300, 2],
  [1000, 3],
  [3000, 4]
];

// ─── Unlockable garden elements ───────────────────────────────────────────────
const UNLOCK_RULES: { id: string; condition: (s: GardenState) => boolean }[] = [
  { id: 'small_flowers', condition: (s) => s.totalXP >= 60 },
  { id: 'rich_grass', condition: (s) => s.totalXP >= 150 },
  { id: 'first_tree', condition: (s) => s.readPages.length >= 10 },
  { id: 'pathway', condition: (s) => s.readPages.length >= 30 },
  { id: 'wisdom_tree', condition: (s) => s.actionCounts.read_tafsir >= 10 },
  { id: 'stream', condition: (s) => s.readPages.length >= 60 },
  { id: 'birds', condition: (s) => s.totalXP >= 800 },
  { id: 'fruit_tree', condition: (s) => s.readPages.length >= 100 },
  { id: 'glow_path', condition: (s) => s.actionCounts.read_tafsir >= 30 },
  { id: 'rare_flowers', condition: (s) => s.readPages.length >= 200 },
  { id: 'waterfall', condition: (s) => s.readPages.length >= 400 },
  { id: 'golden_light', condition: (s) => s.readPages.length >= 604 } // all 604 pages
];

// ─── Storage key ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'hidaayah_garden_v2';

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
    // Back-compat: ensure readPages exists
    if (!Array.isArray(parsed.readPages)) parsed.readPages = [];
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

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('garden:xp', { detail: { xp, action } }));
  }

  return newState;
}

// Awards XP for reading a Mushaf page only if it hasn't been read before.
// Returns the XP awarded (0 if already counted).
export function awardPageXP(pageNumber: number): number {
  const state = loadGarden();
  if (state.readPages.includes(pageNumber)) return 0;

  const base = XP_TABLE.read_page;
  const streakBonus = state.streakDays >= 7 ? 1.2 : state.streakDays >= 3 ? 1.1 : 1;
  const xp = Math.round(base * streakBonus);

  const today = todayISO();
  const monday = getMondayISO();

  const newState: GardenState = {
    ...state,
    totalXP: state.totalXP + xp,
    weeklyXP: (state.weekStart === monday ? state.weeklyXP : 0) + xp,
    weekStart: monday,
    lastActivityDate: today,
    readPages: [...state.readPages, pageNumber],
    actionCounts: {
      ...state.actionCounts,
      read_page: (state.actionCounts.read_page ?? 0) + 1
    },
    lastXPGain: { amount: xp, action: 'read_page', ts: Date.now() }
  };

  newState.level = computeLevel(newState.totalXP);
  newState.stage = computeStage(newState.totalXP);
  newState.unlockedElements = computeUnlocks(newState);

  saveGarden(newState);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('garden:xp', { detail: { xp, action: 'read_page' } }));
  }

  return xp;
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
      read_page: 0,
      read_tafsir: 0
    },
    unlockedElements: [],
    readPages: [],
    lastXPGain: null
  };
}
