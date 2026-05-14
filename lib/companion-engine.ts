// ─── Quran Companion Intent Engine ────────────────────────────────────────────
// Pure rule-based system: parse the user's message → pick a QF API call →
// fetch live data → return a formatted response string. No LLM required.

import {
  fetchChapter,
  fetchChapters,
  fetchVerseByKey,
  fetchVersesByChapter,
  fetchRandomAyah,
  fetchJuzs,
  fetchHizbs
} from '@/app/(app)/dashboard/quran/queries';
import { fetchTafsirByAyah, searchQuran } from '@/app/(app)/dashboard/guidance/queries';
import { QF_DEFAULT_TAFSIR_ID, QF_DEFAULT_TRANSLATION_ID } from '@/config';

// ─── Surah name → number map ──────────────────────────────────────────────────
// Covers common English spellings, transliterations, and Arabic names
const SURAH_NAMES: Record<string, number> = {
  'al-fatihah': 1,
  'al fatihah': 1,
  fatiha: 1,
  fatihah: 1,
  'the opening': 1,
  'al-baqarah': 2,
  'al baqarah': 2,
  baqarah: 2,
  'the cow': 2,
  'al-imran': 3,
  'al imran': 3,
  imran: 3,
  'family of imran': 3,
  'an-nisa': 4,
  'an nisa': 4,
  nisa: 4,
  'the women': 4,
  'al-maidah': 5,
  'al maidah': 5,
  maidah: 5,
  'the table': 5,
  'al-anam': 6,
  'al anam': 6,
  anam: 6,
  'the cattle': 6,
  'al-araf': 7,
  'al araf': 7,
  araf: 7,
  'the heights': 7,
  'al-anfal': 8,
  'al anfal': 8,
  anfal: 8,
  'the spoils': 8,
  'at-tawbah': 9,
  'at tawbah': 9,
  tawbah: 9,
  repentance: 9,
  yunus: 10,
  jonah: 10,
  hud: 11,
  yusuf: 12,
  joseph: 12,
  'ar-rad': 13,
  thunder: 13,
  ibrahim: 14,
  abraham: 14,
  'al-hijr': 15,
  'an-nahl': 16,
  'the bee': 16,
  nahl: 16,
  'al-isra': 17,
  isra: 17,
  'the night journey': 17,
  'al-kahf': 18,
  'al kahf': 18,
  kahf: 18,
  'the cave': 18,
  maryam: 19,
  mary: 19,
  'ta-ha': 20,
  taha: 20,
  'al-anbiya': 21,
  'the prophets': 21,
  'al-hajj': 22,
  'the pilgrimage': 22,
  'al-muminun': 23,
  'the believers': 23,
  'an-nur': 24,
  'the light': 24,
  nur: 24,
  'al-furqan': 25,
  'the criterion': 25,
  'ash-shuara': 26,
  'the poets': 26,
  'an-naml': 27,
  'the ant': 27,
  'al-qasas': 28,
  'the stories': 28,
  'al-ankabut': 29,
  'the spider': 29,
  'ar-rum': 30,
  'the romans': 30,
  luqman: 31,
  'as-sajdah': 32,
  sajdah: 32,
  'the prostration': 32,
  'al-ahzab': 33,
  'the combined forces': 33,
  saba: 34,
  fatir: 35,
  'the originator': 35,
  yasin: 36,
  'ya-sin': 36,
  'as-saffat': 37,
  'those who set the ranks': 37,
  sad: 38,
  'az-zumar': 39,
  'the troops': 39,
  ghafir: 40,
  'the forgiver': 40,
  fussilat: 41,
  'ash-shura': 42,
  'the counsel': 42,
  'az-zukhruf': 43,
  'the ornaments': 43,
  'ad-dukhan': 44,
  'the smoke': 44,
  'al-jathiyah': 45,
  'the kneeling': 45,
  'al-ahqaf': 46,
  muhammad: 47,
  'al-fath': 48,
  'the victory': 48,
  fath: 48,
  'al-hujurat': 49,
  'the rooms': 49,
  qaf: 50,
  'adh-dhariyat': 51,
  'the winnowing winds': 51,
  'at-tur': 52,
  'the mount': 52,
  'an-najm': 53,
  'the star': 53,
  'al-qamar': 54,
  'the moon': 54,
  'ar-rahman': 55,
  rahman: 55,
  'the beneficent': 55,
  'al-waqiah': 56,
  'al waqiah': 56,
  waqiah: 56,
  'the inevitable': 56,
  'al-hadid': 57,
  'the iron': 57,
  'al-mujadila': 58,
  'the pleading woman': 58,
  'al-hashr': 59,
  'the exile': 59,
  'al-mumtahanah': 60,
  'she that is to be examined': 60,
  'as-saf': 61,
  'the ranks': 61,
  'al-jumuah': 62,
  'the congregation': 62,
  jumuah: 62,
  'al-munafiqun': 63,
  'the hypocrites': 63,
  'at-taghabun': 64,
  'mutual disillusion': 64,
  'at-talaq': 65,
  'the divorce': 65,
  'at-tahrim': 66,
  'the prohibition': 66,
  'al-mulk': 67,
  mulk: 67,
  'the sovereignty': 67,
  'al-qalam': 68,
  'the pen': 68,
  'al-haqqah': 69,
  'the reality': 69,
  'al-maarij': 70,
  'the ascending stairways': 70,
  nuh: 71,
  noah: 71,
  'al-jinn': 72,
  'the jinn': 72,
  'al-muzzammil': 73,
  'the enshrouded one': 73,
  'al-muddaththir': 74,
  'the cloaked one': 74,
  'al-qiyamah': 75,
  'the resurrection': 75,
  'al-insan': 76,
  'the man': 76,
  insan: 76,
  'al-mursalat': 77,
  'the emissaries': 77,
  'an-naba': 78,
  naba: 78,
  'the tidings': 78,
  'an-naziat': 79,
  'those who drag forth': 79,
  abasa: 80,
  'he frowned': 80,
  'at-takwir': 81,
  'the overthrowing': 81,
  'al-infitar': 82,
  'the cleaving': 82,
  'al-mutaffifin': 83,
  defrauding: 83,
  'al-inshiqaq': 84,
  'the sundering': 84,
  'al-buruj': 85,
  'the mansions of the stars': 85,
  'at-tariq': 86,
  'the morning star': 86,
  'al-ala': 87,
  'the most high': 87,
  'al-ghashiyah': 88,
  'the overwhelming': 88,
  'al-fajr': 89,
  fajr: 89,
  'the dawn': 89,
  'al-balad': 90,
  'the city': 90,
  'ash-shams': 91,
  'the sun': 91,
  'al-layl': 92,
  'the night': 92,
  layl: 92,
  'ad-duha': 93,
  duha: 93,
  'the morning hours': 93,
  'ash-sharh': 94,
  'the relief': 94,
  sharh: 94,
  'at-tin': 95,
  'the fig': 95,
  'al-alaq': 96,
  alaq: 96,
  'the clot': 96,
  'al-qadr': 97,
  qadr: 97,
  'the power': 97,
  'night of power': 97,
  'al-bayyinah': 98,
  'the clear proof': 98,
  'az-zalzalah': 99,
  'the earthquake': 99,
  'al-adiyat': 100,
  'the coursers': 100,
  'al-qariah': 101,
  'the calamity': 101,
  'at-takathur': 102,
  'the rivalry in world increase': 102,
  'al-asr': 103,
  asr: 103,
  'the declining day': 103,
  'al-humazah': 104,
  'the traducer': 104,
  'al-fil': 105,
  'the elephant': 105,
  quraysh: 106,
  quraish: 106,
  'al-maun': 107,
  'the small kindnesses': 107,
  'al-kawthar': 108,
  kawthar: 108,
  abundance: 108,
  'al-kafirun': 109,
  'the disbelievers': 109,
  'an-nasr': 110,
  'the divine support': 110,
  nasr: 110,
  'al-masad': 111,
  lahab: 111,
  'palm fiber': 111,
  'al-ikhlas': 112,
  ikhlas: 112,
  sincerity: 112,
  'the purity': 112,
  'al-falaq': 113,
  falaq: 113,
  'the daybreak': 113,
  'an-nas': 114,
  nas: 114,
  mankind: 114
};

// ─── Reciter fuzzy name map ───────────────────────────────────────────────────
// Maps every common spelling / transliteration variant to the canonical display
// name that the QF API returns (used as a search term in RecitersBrowser).
// Values are substrings of the exact API reciter names so RecitersBrowser's
// case-insensitive includes() filter picks them up correctly.
const RECITER_ALIASES: Record<string, string> = {
  // Mishari Rashid al-`Afasy
  mishary: 'Mishari',
  mishari: 'Mishari',
  'mishary alafasy': 'Mishari',
  'mishari alafasy': 'Mishari',
  'mishary rashid': 'Mishari',
  'mishari rashid': 'Mishari',
  alafasy: 'Mishari',
  afasy: 'Mishari',
  'al afasy': 'Mishari',
  'al-afasy': 'Mishari',

  // Abdul Basit Abdul Samad
  'abdul basit': 'Abdul Basit',
  'abdel baset': 'Abdul Basit',
  'abdel basit': 'Abdul Basit',
  abdulbasit: 'Abdul Basit',
  basit: 'Abdul Basit',

  // Abdur-Rahman as-Sudais
  sudais: 'Sudais',
  'al sudais': 'Sudais',
  'as sudais': 'Sudais',
  'abdulrahman sudais': 'Sudais',
  'rahman sudais': 'Sudais',
  'abdur rahman': 'Sudais',

  // Sa`ud ash-Shuraym
  shuraim: 'Shuraym',
  shuraym: 'Shuraym',
  'al shuraim': 'Shuraym',
  'saud shuraim': 'Shuraym',
  'saoud shuraym': 'Shuraym',

  // Mahmoud Khaleel Al-Husary
  husary: 'Husary',
  hussary: 'Husary',
  husari: 'Husary',
  hussari: 'Husary',
  'al husary': 'Husary',
  'mahmoud husary': 'Husary',
  'khalil husary': 'Husary',
  'khaleel husary': 'Husary',

  // Muhammad Siddiq al-Minshawi
  minshawi: 'Minshawi',
  minshawy: 'Minshawi',
  'al minshawi': 'Minshawi',
  'siddiq minshawi': 'Minshawi',
  minshawi_mujawwad: 'Minshawi',

  // Saad al-Ghamdi
  ghamdi: 'Ghamdi',
  'al ghamdi': 'Ghamdi',
  'saad ghamdi': 'Ghamdi',

  // Ahmed ibn Ali al-Ajmy
  ajamy: 'Ajm',
  ajami: 'Ajm',
  ajmy: 'Ajm',
  'al ajmy': 'Ajm',
  'ahmed ajamy': 'Ajm',
  'ahmad ajamy': 'Ajm',

  // Abu Bakr al-Shatri
  shatri: 'Shatri',
  'ash shatri': 'Shatri',
  'al shatri': 'Shatri',
  'abu bakr shatri': 'Shatri',
  'abubakr shatri': 'Shatri',

  // Hani ar-Rifai
  rifai: 'Rifai',
  'hani rifai': 'Rifai',
  'ar rifai': 'Rifai',

  // Maher al-Muaiqly
  maher: 'Muaiqly',
  muaiqly: 'Muaiqly',
  'al muaiqly': 'Muaiqly',
  'maher muaiqly': 'Muaiqly',

  // Yasser ad-Dussary
  yasser: 'Dussary',
  yasir: 'Dussary',
  yesir: 'Dussary',
  yaser: 'Dussary',
  dosari: 'Dussary',
  dossari: 'Dussary',
  dussary: 'Dussary',
  'al dosari': 'Dussary',
  'yasser dosari': 'Dussary',
  'yasir dosari': 'Dussary',
  'yasser dussary': 'Dussary',

  // Abdullah Ali Jabir
  jabir: 'Jabir',
  jaber: 'Jabir',
  'ali jabir': 'Jabir',
  'abdullah jabir': 'Jabir',

  // Bandar Baleela
  baleela: 'Baleela',
  balila: 'Baleela',
  'bandar baleela': 'Baleela',

  // Khalifah Al Tunaiji
  tunaiji: 'Tunaiji',
  'al tunaiji': 'Tunaiji'
};

function extractReciterName(text: string): string | null {
  const t = normalise(text);
  const sorted = Object.keys(RECITER_ALIASES).sort((a, b) => b.length - a.length);
  for (const alias of sorted) {
    if (t.includes(alias)) return RECITER_ALIASES[alias];
  }
  return null;
}

// ─── Intent types ─────────────────────────────────────────────────────────────
export type Intent =
  | { type: 'verse'; verseKey: string }
  | { type: 'tafsir'; verseKey: string }
  | { type: 'surah_info'; chapterNumber: number }
  | { type: 'surah_verses'; chapterNumber: number; page: number }
  | { type: 'search'; query: string }
  | { type: 'random' }
  | { type: 'list_surahs' }
  | { type: 'juz_info'; juzNumber: number }
  | { type: 'hizb_info'; hizbNumber: number }
  | { type: 'page_info'; pageNumber: number }
  | { type: 'reciter'; name: string }
  | { type: 'unknown' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function normalise(s: string): string {
  return s
    .toLowerCase()
    .replace(/['''`]/g, "'")
    .trim();
}

// Extract a verse key like "2:255", "2 255", "surah 2 verse 255"
function extractVerseKey(text: string): string | null {
  // Standard colon form
  const colon = text.match(/\b(\d{1,3})\s*:\s*(\d{1,3})\b/);
  if (colon) return `${colon[1]}:${colon[2]}`;
  // "surah N verse V" or "chapter N ayah V"
  const worded = text.match(/(?:surah|chapter|sura)\s+(\d+)\s+(?:verse|ayah|ayat|aya)\s+(\d+)/i);
  if (worded) return `${worded[1]}:${worded[2]}`;
  // "verse N of surah M"
  const reversed = text.match(/(?:verse|ayah|ayat)\s+(\d+)\s+of\s+(?:surah|chapter)?\s*(\d+)/i);
  if (reversed) return `${reversed[2]}:${reversed[1]}`;
  return null;
}

// Extract a chapter number from text (number or name)
function extractChapterNumber(text: string): number | null {
  const n = normalise(text);
  // Direct number after surah/chapter keyword
  const direct = n.match(/(?:surah|chapter|sura)\s+(\d+)/);
  if (direct) return parseInt(direct[1], 10);
  // Standalone number (when context is clear)
  const standalone = n.match(/\b(\d{1,3})\b/);
  if (standalone) {
    const num = parseInt(standalone[1], 10);
    if (num >= 1 && num <= 114) return num;
  }
  // Name lookup — try longest match first
  const sorted = Object.keys(SURAH_NAMES).sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    if (n.includes(name)) return SURAH_NAMES[name];
  }
  return null;
}

function extractJuzNumber(text: string): number | null {
  // juz / juzu / juz' / jooz / juz-ul / para / parah / sipara / siparah
  const m = text.match(
    /\b(?:juz[uoauh']?\s*(?:ul|al|el)?\s*|para(?:h|h\s)?|si\s*para(?:h)?\s*)(\d+)/i
  );
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 30) return n;
  }
  return null;
}

function extractHizbNumber(text: string): number | null {
  // hizb / hizbu / hizbi / hisb / hisbu / hisbi / hizbul / hizb-ul
  const m = text.match(/\b(?:h[iy]z?bu?\s*(?:ul|al|el)?\s*|h[iy]s?b[uia]?\s*)(?:number\s*)?(\d+)/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 60) return n;
  }
  return null;
}

function extractPageNumber(text: string): number | null {
  // page / safha / safahat / wajh + number; also plain "page N"
  const m =
    text.match(
      /\b(?:(?:mushaf|quran)\s+)?(?:page|safha[h]?|safahat|wajh)\s+(?:number\s+)?(\d+)\b/i
    ) ?? text.match(/\bpage\s+(?:number\s+)?(\d+)\b/i);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 604) return n;
  }
  return null;
}

// ─── Intent parser ────────────────────────────────────────────────────────────
export function parseIntent(raw: string): Intent {
  const t = normalise(raw);

  // Random ayah
  if (/\b(random|surprise me|any (verse|ayah)|give me (an?|a random))\b/.test(t)) {
    return { type: 'random' };
  }

  // List all surahs
  if (
    /\b(list|all|show|what are the)\b.{0,20}\b(surahs?|chapters?)\b/.test(t) &&
    !/(info|about|verses? of|text of)/.test(t)
  ) {
    return { type: 'list_surahs' };
  }

  // Tafsir — must check before verse so "tafsir of 2:255" is caught
  if (
    /\b(tafsir|tafseer|explanation|explain|commentary|meaning of verse|deeper meaning)\b/.test(t)
  ) {
    const vk = extractVerseKey(t);
    if (vk) return { type: 'tafsir', verseKey: vk };
    // tafsir of a surah without specific verse — default to 1:1
    const ch = extractChapterNumber(t);
    if (ch) return { type: 'tafsir', verseKey: `${ch}:1` };
  }

  // Specific verse fetch
  const vk = extractVerseKey(t);
  if (vk) {
    // "tafsir" already caught above; anything else → show verse
    return { type: 'verse', verseKey: vk };
  }

  // Reciter navigation
  const reciterName = extractReciterName(t);
  if (reciterName) return { type: 'reciter', name: reciterName };

  // Hizb info — check before juz to avoid number collision
  const hizbNum = extractHizbNumber(t);
  if (hizbNum) return { type: 'hizb_info', hizbNumber: hizbNum };

  // Juz info
  const juzNum = extractJuzNumber(t);
  if (juzNum) return { type: 'juz_info', juzNumber: juzNum };

  // Mushaf page
  const pgNum = extractPageNumber(t);
  if (pgNum) return { type: 'page_info', pageNumber: pgNum };

  // Surah info vs surah verses
  const ch = extractChapterNumber(t);
  if (ch) {
    const wantsVerses = /\b(verses?|ayat|ayah|read|show|display|text|content|first \d+)\b/.test(t);
    const wantsInfo =
      /\b(info|about|tell me|what is|what'?s|overview|details?|mean|meaning)\b/.test(t);
    if (wantsVerses && !wantsInfo) {
      const pageMatch = t.match(/page\s*(\d+)/);
      return {
        type: 'surah_verses',
        chapterNumber: ch,
        page: pageMatch ? parseInt(pageMatch[1], 10) : 1
      };
    }
    // default to info when only surah identified
    return { type: 'surah_info', chapterNumber: ch };
  }

  // Search — topics, themes, keywords
  if (
    /\b(search|find|where|which|locate|look for|verses? (about|on|regarding)|quran (say|teach|mention)|what does (the )?quran)\b/.test(
      t
    )
  ) {
    // Strip intent words to get the actual query
    const query = raw
      .replace(
        /^(search for|find verses? (about|on|regarding)?|where (does the quran|in the quran)|what does the quran (say|teach|mention) about|which verse(s)? (talk|speak|mention)s? about|look for)/i,
        ''
      )
      .trim();
    return { type: 'search', query: query || raw };
  }

  // Fallback: if the message is short and clearly a topic, try search
  if (raw.trim().split(/\s+/).length <= 6 && raw.trim().length > 2) {
    return { type: 'search', query: raw.trim() };
  }

  return { type: 'unknown' };
}

// ─── Response builder ─────────────────────────────────────────────────────────
export interface CompanionResponse {
  text: string;
  verseKey?: string;
  chapterNumber?: number;
  juzNumber?: number;
  hizbNumber?: number;
  pageNumber?: number;
  reciterName?: string;
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function verseBlock(verseKey: string, arabic: string, translation: string): string {
  return `**${verseKey}**\n\n${arabic}\n\n*${translation}*`;
}

export async function resolveIntent(intent: Intent): Promise<CompanionResponse> {
  switch (intent.type) {
    // ── Specific verse ────────────────────────────────────────────────────────
    case 'verse': {
      const data = await fetchVerseByKey(intent.verseKey, {
        translations: String(QF_DEFAULT_TRANSLATION_ID),
        words: false,
        fields: 'text_uthmani'
      });
      const v = data.verse;
      if (!v) return { text: `Verse ${intent.verseKey} was not found.` };
      const translation = stripHtml(v.translations?.[0]?.text ?? '');
      return {
        text: verseBlock(intent.verseKey, v.text_uthmani, translation),
        verseKey: intent.verseKey,
        chapterNumber: v.chapter_id ?? parseInt(intent.verseKey.split(':')[0], 10)
      };
    }

    // ── Tafsir ────────────────────────────────────────────────────────────────
    case 'tafsir': {
      const [verseData, tafsirData] = await Promise.all([
        fetchVerseByKey(intent.verseKey, {
          translations: String(QF_DEFAULT_TRANSLATION_ID),
          words: false,
          fields: 'text_uthmani'
        }),
        fetchTafsirByAyah(QF_DEFAULT_TAFSIR_ID, intent.verseKey)
      ]);
      const v = verseData.verse;
      const tafsirText = stripHtml(tafsirData.tafsirs?.[0]?.text ?? tafsirData.tafsir?.text ?? '');
      if (!v) return { text: `Verse ${intent.verseKey} was not found.` };
      const translation = stripHtml(v.translations?.[0]?.text ?? '');
      const excerpt = tafsirText
        ? tafsirText.slice(0, 900) + (tafsirText.length > 900 ? '…' : '')
        : '';
      const tafsirSection = excerpt
        ? `\n\n**Tafsir Ibn Kathir:**\n${excerpt}`
        : '\n\n*Tafsir not available for this verse.*';
      return {
        text: verseBlock(intent.verseKey, v.text_uthmani, translation) + tafsirSection,
        verseKey: intent.verseKey,
        chapterNumber: v.chapter_id ?? parseInt(intent.verseKey.split(':')[0], 10)
      };
    }

    // ── Surah info ────────────────────────────────────────────────────────────
    case 'surah_info': {
      const res = await fetchChapter(intent.chapterNumber);
      const ch = res.chapter;
      if (!ch) return { text: `Surah ${intent.chapterNumber} not found.` };
      const lines = [
        `**Surah ${ch.name_simple} (${ch.name_arabic})**`,
        `*${ch.translated_name?.name ?? ''}*`,
        '',
        `• **Number:** ${ch.id}`,
        `• **Revelation:** ${ch.revelation_place === 'makkah' ? 'Meccan' : 'Medinan'}`,
        `• **Verses:** ${ch.verses_count}`,
        `• **Pages:** ${ch.pages?.[0]}–${ch.pages?.[ch.pages.length - 1]}`
      ];
      return { text: lines.join('\n'), chapterNumber: intent.chapterNumber };
    }

    // ── Surah verses ──────────────────────────────────────────────────────────
    case 'surah_verses': {
      const [chRes, versesRes] = await Promise.all([
        fetchChapter(intent.chapterNumber),
        fetchVersesByChapter(intent.chapterNumber, {
          translations: String(QF_DEFAULT_TRANSLATION_ID),
          words: false,
          fields: 'text_uthmani',
          page: intent.page,
          per_page: 5
        })
      ]);
      const ch = chRes.chapter;
      const verses = versesRes.verses ?? [];
      const pagination = versesRes.pagination;
      if (verses.length === 0)
        return { text: `No verses found for Surah ${intent.chapterNumber}.` };

      const header = ch
        ? `**Surah ${ch.name_simple} (${ch.name_arabic})** — ${ch.verses_count} verses\n*Showing ${verses[0].verse_number}–${verses[verses.length - 1].verse_number} of ${pagination?.total_records ?? ch.verses_count}*\n`
        : `**Surah ${intent.chapterNumber}**\n`;

      const blocks = verses.map((v) => {
        const translation = stripHtml(v.translations?.[0]?.text ?? '');
        return `**${v.verse_key}** ${v.text_uthmani}\n${translation}`;
      });

      const footer =
        pagination && pagination.current_page < pagination.total_pages
          ? `\n*Ask "show more" or "page ${pagination.current_page + 1} of surah ${intent.chapterNumber}" for the next verses.*`
          : '';

      return {
        text: header + '\n' + blocks.join('\n\n') + footer,
        chapterNumber: intent.chapterNumber
      };
    }

    // ── Search ────────────────────────────────────────────────────────────────
    case 'search': {
      const res = await searchQuran({
        mode: 'quick',
        query: intent.query,
        size: 5,
        get_text: '1',
        translation_ids: '131',
        versesResultsNumber: 5,
        navigationalResultsNumber: 3
      });
      const navItems = res.result?.navigation ?? [];
      const verses = res.result?.verses ?? [];

      if (navItems.length === 0 && verses.length === 0) {
        return {
          text: `No results found for "${intent.query}". Try a different topic or keyword.`
        };
      }

      const header = `**Search results for "${intent.query}":**\n`;
      const lines: string[] = [];

      // Navigation results (surah/juz matches)
      for (const n of navItems.slice(0, 3)) {
        lines.push(`• **${n.name}** — ${n.arabic ?? ''}`);
      }

      // Verse results — key is the verse key like "2:255"
      const firstVerseKey = verses[0]?.key as string | undefined;
      for (const v of verses.slice(0, 5)) {
        lines.push(`• **${v.key}** — ${v.name}`);
      }

      return {
        text: header + lines.join('\n'),
        verseKey: firstVerseKey
      };
    }

    // ── Random ayah ───────────────────────────────────────────────────────────
    case 'random': {
      const res = await fetchRandomAyah();
      const v = res?.verse;
      if (!v) return { text: 'Could not fetch a random ayah. Please try again.' };
      const translation = stripHtml(v.translations?.[0]?.text ?? '');
      return {
        text: `**A verse for you:**\n\n${verseBlock(v.verse_key, v.text_uthmani, translation)}`,
        verseKey: v.verse_key
      };
    }

    // ── List surahs ───────────────────────────────────────────────────────────
    case 'list_surahs': {
      const res = await fetchChapters('en');
      const chapters = res.chapters ?? [];
      const lines = chapters.map(
        (c) =>
          `**${c.id}.** ${c.name_simple} (${c.name_arabic}) — ${c.translated_name?.name}, ${c.verses_count} verses`
      );
      return {
        text: `**All 114 Surahs:**\n\n${lines.join('\n')}`
      };
    }

    // ── Juz info ──────────────────────────────────────────────────────────────
    case 'juz_info': {
      const [juzRes, chaptersRes] = await Promise.all([fetchJuzs(), fetchChapters('en')]);
      const seen = new Set<number>();
      const juzs = (juzRes.juzs ?? []).filter(
        (j) => !seen.has(j.juz_number) && seen.add(j.juz_number)
      );
      const juz = juzs.find((j) => j.juz_number === intent.juzNumber);
      if (!juz) return { text: `Juz ${intent.juzNumber} not found.` };

      // Build chapter map for quick lookup
      const chapterMap = Object.fromEntries(
        (chaptersRes.chapters ?? []).map((c) => [String(c.id), c])
      );

      const entries = Object.entries(juz.verse_mapping);
      const [firstCh, firstRange] = entries[0];
      const [lastCh, lastRange] = entries[entries.length - 1];
      const startVerse = `${firstCh}:${firstRange.split('-')[0]}`;
      const endVerse = `${lastCh}:${lastRange.split('-')[1] ?? lastRange.split('-')[0]}`;

      // Build enriched surah list
      const surahLines = entries.map(([chId, range]) => {
        const ch = chapterMap[chId];
        const [from, to] = range.split('-');
        const verseRange = to && to !== from ? `${from}–${to}` : `${from}`;
        if (ch) {
          return `• **${ch.name_simple}** (${ch.name_arabic}) — *${ch.translated_name?.name}* · verses ${verseRange}`;
        }
        return `• Surah ${chId} · verses ${verseRange}`;
      });

      const totalVerses = entries.reduce((sum, [, range]) => {
        const [from, to] = range.split('-').map(Number);
        return sum + (to ? to - from + 1 : 1);
      }, 0);

      const lines = [
        `**Juz ${juz.juz_number}**`,
        '',
        `• **Starts:** ${startVerse}`,
        `• **Ends:** ${endVerse}`,
        `• **Surahs:** ${entries.length}`,
        `• **Verses:** ~${totalVerses}`,
        '',
        '**Surahs in this Juz:**',
        ...surahLines
      ];

      return {
        text: lines.join('\n'),
        juzNumber: intent.juzNumber
      };
    }

    // ── Hizb info ─────────────────────────────────────────────────────────────
    case 'hizb_info': {
      const [hizbRes, chaptersRes] = await Promise.all([fetchHizbs(), fetchChapters('en')]);
      const seen = new Set<number>();
      const hizbs = (hizbRes.hizbs ?? []).filter(
        (h) => !seen.has(h.hizb_number) && seen.add(h.hizb_number)
      );
      const hizb = hizbs.find((h) => h.hizb_number === intent.hizbNumber);
      if (!hizb) return { text: `Hizb ${intent.hizbNumber} not found.` };

      const chapterMap = Object.fromEntries(
        (chaptersRes.chapters ?? []).map((c) => [String(c.id), c])
      );

      const entries = Object.entries(hizb.verse_mapping);
      const [firstCh, firstRange] = entries[0];
      const [lastCh, lastRange] = entries[entries.length - 1];
      const startVerse = `${firstCh}:${firstRange.split('-')[0]}`;
      const endVerse = `${lastCh}:${lastRange.split('-')[1] ?? lastRange.split('-')[0]}`;

      const surahLines = entries.map(([chId, range]) => {
        const ch = chapterMap[chId];
        const [from, to] = range.split('-');
        const verseRange = to && to !== from ? `${from}–${to}` : `${from}`;
        if (ch) {
          return `• **${ch.name_simple}** (${ch.name_arabic}) — *${ch.translated_name?.name}* · verses ${verseRange}`;
        }
        return `• Surah ${chId} · verses ${verseRange}`;
      });

      const totalVerses = entries.reduce((sum, [, range]) => {
        const [from, to] = range.split('-').map(Number);
        return sum + (to ? to - from + 1 : 1);
      }, 0);

      const lines = [
        `**Hizb ${hizb.hizb_number}**`,
        '',
        `• **Starts:** ${startVerse}`,
        `• **Ends:** ${endVerse}`,
        `• **Surahs:** ${entries.length}`,
        `• **Verses:** ~${totalVerses}`,
        '',
        '**Surahs in this Hizb:**',
        ...surahLines
      ];

      return {
        text: lines.join('\n'),
        hizbNumber: intent.hizbNumber
      };
    }

    // ── Page info ─────────────────────────────────────────────────────────────
    case 'page_info': {
      const chaptersRes = await fetchChapters('en');
      const chapters = chaptersRes.chapters ?? [];

      // Find which surahs appear on this page using the pages array [startPage, endPage]
      const surahs = chapters.filter((c) => {
        const [start, end] = c.pages ?? [];
        return start <= intent.pageNumber && intent.pageNumber <= end;
      });

      if (surahs.length === 0) {
        return { text: `Page ${intent.pageNumber} is not a valid Mushaf page (1–604).` };
      }

      const surahLines = surahs.map(
        (c) =>
          `• **${c.name_simple}** (${c.name_arabic}) — *${c.translated_name?.name}* · ${c.verses_count} verses`
      );

      const lines = [
        `**Mushaf Page ${intent.pageNumber}**`,
        '',
        `**Surah${surahs.length > 1 ? 's' : ''} on this page:**`,
        ...surahLines
      ];

      return {
        text: lines.join('\n'),
        pageNumber: intent.pageNumber
      };
    }

    // ── Reciter navigation ────────────────────────────────────────────────────
    case 'reciter':
      return {
        text: `Opening **${intent.name}** in the Reciters tab — you can pick any surah and listen there.`,
        reciterName: intent.name
      };

    // ── Unknown ───────────────────────────────────────────────────────────────
    case 'unknown':
      return {
        text: `I can help you with:\n\n• **A specific verse** — e.g. *"Show me 2:255"*\n• **Tafsir** — e.g. *"Tafsir of 67:1"*\n• **Surah info** — e.g. *"Tell me about Surah Al-Kahf"*\n• **Read a surah** — e.g. *"Show verses of Surah Yasin"*\n• **Search by topic** — e.g. *"Find verses about patience"*\n• **Juz** — e.g. *"What's in Juz 30?"*\n• **Hizb** — e.g. *"What's in Hizb 1?"*\n• **Mushaf page** — e.g. *"What's on page 50?"*\n• **Reciter** — e.g. *"Find reciter Mishary"*\n• **Random ayah** — just say *"Surprise me"*`
      };

    default:
      return { text: 'I did not understand that. Please try rephrasing your question.' };
  }
}
