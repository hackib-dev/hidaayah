import type { ContentPagination } from '@/app/apiService/quranFoundationService/types';

// ─── Search ───────────────────────────────────────────────────────────────────
export type SearchMode = 'quick' | 'advanced';

export type SearchResultType =
  | 'surah'
  | 'juz'
  | 'hizb'
  | 'rub_el_hizb'
  | 'ayah'
  | 'page'
  | 'range'
  | 'quran_range'
  | 'search_page';

export interface SearchNavigationResult {
  result_type: SearchResultType;
  key: string | number;
  name: string;
  arabic?: string;
  isArabic?: boolean;
  isTransliteration?: boolean;
}

export interface SearchVerseResult {
  result_type: SearchResultType;
  key: string;
  name: string;
  arabic?: string;
  isArabic?: boolean;
  isTransliteration?: boolean;
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
  indexes?: string;
  translation_ids?: string;
  page?: number;
  size?: number;
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
