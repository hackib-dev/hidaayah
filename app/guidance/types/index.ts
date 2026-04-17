import type { ContentPagination } from '@/app/apiService/quranFoundationService/types';

// ─── Search ───────────────────────────────────────────────────────────────────
export type SearchMode = 'quick' | 'advanced';

export interface SearchNavigationResult {
  result_type: 'surah' | 'juz' | 'hizb' | 'rub_el_hizb' | 'ayah' | 'page' | 'range';
  key: string;
  name: string;
  arabic: string;
  isArabic: boolean;
}

export interface SearchVerseResult {
  result_type: string;
  key: string;
  name: string;
  isArabic: boolean;
}

export interface SearchResult {
  navigation: SearchNavigationResult[];
  verses: SearchVerseResult[];
}

export interface SearchResponse {
  pagination: ContentPagination;
  result: SearchResult;
}

export interface SearchParams {
  mode: SearchMode;
  query: string;
  filter_translations?: string;
  exact_matches_only?: '0' | '1';
  get_text?: '0' | '1';
  highlight?: '0' | '1';
  navigationalResultsNumber?: number;
  versesResultsNumber?: number;
  translation_ids?: string;
}

// ─── Tafsir ───────────────────────────────────────────────────────────────────
export interface TafsirEntry {
  id: number;
  resource_id: number;
  text: string;
  verse_key: string;
  slug: string;
  // optional fields returned only when requested via ?fields=
  verse_number?: number;
  language_id?: number;
  chapter_id?: number;
  juz_number?: number;
  hizb_number?: number;
  rub_el_hizb_number?: number;
  page_number?: number;
  ruku_number?: number;
  manzil_number?: number;
  language_name?: string;
  resource_name?: string;
}

export interface TafsirResponse {
  tafsir?: TafsirEntry; // by_ayah endpoint returns singular object
  tafsirs?: TafsirEntry[]; // by_chapter endpoint returns array
  pagination?: ContentPagination;
}

export interface TafsirResource {
  id: number;
  name: string;
  language_name: string;
  author_name: string;
}

export interface ListTafsirsResponse {
  tafsirs: TafsirResource[];
}
