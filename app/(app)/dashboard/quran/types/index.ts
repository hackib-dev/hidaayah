import type { ContentPagination } from '@/app/apiService/quranFoundationService/types';

// ─── Chapter ─────────────────────────────────────────────────────────────────────
export interface TranslatedName {
  language_name: string;
  name: string;
}

export interface Chapter {
  id: number;
  revelation_place: 'makkah' | 'madinah';
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: number[];
  translated_name: TranslatedName;
}

export interface ListChaptersResponse {
  chapters: Chapter[];
}

// ─── Word ────────────────────────────────────────────────────────────────────────
export interface WordTranslation {
  text: string;
  language_name: string;
}

export interface Word {
  id: number;
  position: number;
  text_uthmani: string;
  text_indopak: string;
  text_imlaei: string;
  text_qpc_hafs: string;
  code_v2: string;
  char_type_name: 'word' | 'end' | 'pause' | 'sajdah' | 'rub-el-hizb';
  page_number: number;
  line_number: number;
  audio_url: string;
  translation: WordTranslation;
  transliteration: WordTranslation;
}

// ─── Verse ───────────────────────────────────────────────────────────────────────
export interface VerseTranslation {
  id: number;
  resource_id: number;
  resource_name: string;
  text: string;
  verse_key: string;
}

export interface VerseAudio {
  verse_key: string;
  url: string;
}

export interface VerseTafsir {
  id: number;
  resource_id: number;
  resource_name: string;
  text: string;
  verse_key: string;
  language_name: string;
}

export interface Verse {
  id: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  verse_index: number;
  text_uthmani: string;
  text_indopak: string;
  text_imlaei: string;
  juz_number: number;
  hizb_number: number;
  page_number: number;
  ruku_number: number;
  manzil_number: number;
  image_url?: string;
  words: Word[];
  audio: VerseAudio[];
  translations: VerseTranslation[];
  tafsirs: VerseTafsir[];
}

export interface ListVersesResponse {
  verses: Verse[];
  pagination: ContentPagination;
}

export interface GetVerseResponse {
  verse: Verse;
}

// ─── Query params ────────────────────────────────────────────────────────────────
export interface ListVersesParams {
  language?: string;
  words?: boolean;
  translations?: string;
  audio?: number;
  tafsirs?: string;
  fields?: string;
  page?: number;
  per_page?: number;
}

// ─── Juz / Hizb ──────────────────────────────────────────────────────────────────
export interface JuzVerseMapping {
  verse_key: string;
  verse_id: number;
}

export interface Juz {
  id: number;
  juz_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface ListJuzsResponse {
  juzs: Juz[];
}

export interface Hizb {
  id: number;
  hizb_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface ListHizbsResponse {
  hizbs: Hizb[];
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export interface MushafPage {
  id: number;
  page_number: number;
  verse_mapping: Record<string, string>;
  first_verse_id: number;
  last_verse_id: number;
  verses_count: number;
}

export interface ListPagesResponse {
  pages: MushafPage[];
}

// ─── Reciter / Audio ─────────────────────────────────────────────────────────────
export interface Reciter {
  id: number;
  name: string;
  arabic_name: string;
  relative_path: string;
  format: string;
  files_size: number;
}

export interface ListRecitersResponse {
  reciters: Reciter[];
}

export interface ChapterReciter {
  id: number;
  name: string;
  style: { name: string } | null;
  qirat: { name: string; language_name: string } | null;
  translated_name: { name: string; language_name: string } | null;
}

export interface ListChapterRecitersResponse {
  reciters: ChapterReciter[];
}

export interface AudioTimestamp {
  timestamp_from: number;
  timestamp_to: number;
}

export interface AudioTimestampResponse {
  result: AudioTimestamp;
}
