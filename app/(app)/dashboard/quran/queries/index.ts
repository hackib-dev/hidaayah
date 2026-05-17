import { contentApi } from '@/app/apiService/quranFoundationService';
import type {
  ListChaptersResponse,
  ListVersesResponse,
  GetVerseResponse,
  ListVersesParams,
  ListRecitersResponse,
  ListChapterRecitersResponse,
  ListJuzsResponse,
  ListHizbsResponse,
  ListPagesResponse
} from '@/app/(app)/dashboard/quran/types';
import type { RandomAyahResponse } from '@/app/(app)/dashboard/reflections/types';

// ─── Chapters ─────────────────────────────────────────────────────────────────
export const fetchChapters = async (language = 'en'): Promise<ListChaptersResponse> => {
  const response = await contentApi.get<ListChaptersResponse>('/chapters', {
    params: { language }
  });
  return response.data;
};

export const fetchChapter = async (chapterNumber: number, language = 'en') => {
  const response = await contentApi.get(`/chapters/${chapterNumber}`, {
    params: { language }
  });
  return response.data;
};

// ─── Verses ───────────────────────────────────────────────────────────────────
export const fetchVersesByChapter = async (
  chapterNumber: number,
  params: ListVersesParams = {}
): Promise<ListVersesResponse> => {
  const response = await contentApi.get<ListVersesResponse>(`/verses/by_chapter/${chapterNumber}`, {
    params: {
      language: 'en',
      page: 1,
      per_page: 10,
      fields: 'text_uthmani',
      word_fields: 'text_qpc_hafs,text_uthmani,char_type_name,page_number,line_number',
      mushaf: 1,
      ...params,
      words: params.words ? 'true' : 'false'
    }
  });
  return response.data;
};

export const fetchVersesByJuz = async (
  juzNumber: number,
  params: ListVersesParams = {}
): Promise<ListVersesResponse> => {
  const response = await contentApi.get<ListVersesResponse>(`/verses/by_juz/${juzNumber}`, {
    params: {
      language: 'en',
      page: 1,
      per_page: 10,
      word_fields: 'text_qpc_hafs,text_uthmani,char_type_name,page_number,line_number',
      mushaf: 1,
      ...params,
      words: params.words ? 'true' : 'false'
    }
  });
  return response.data;
};

export const fetchVerseByKey = async (
  verseKey: string,
  params: ListVersesParams = {}
): Promise<GetVerseResponse> => {
  const response = await contentApi.get<GetVerseResponse>(`/verses/by_key/${verseKey}`, {
    params: {
      language: 'en',
      translations: '20', // Saheeh International (English) — resource ID 20
      word_fields: 'text_qpc_hafs,text_uthmani,char_type_name,page_number,line_number',
      mushaf: 1,
      ...params,
      words: params.words !== undefined ? (params.words ? 'true' : 'false') : 'true'
    }
  });
  return response.data;
};

export const fetchVersesByPage = async (
  pageNumber: number,
  params: ListVersesParams = {}
): Promise<ListVersesResponse> => {
  const response = await contentApi.get<ListVersesResponse>(`/verses/by_page/${pageNumber}`, {
    params: {
      language: 'en',
      fields: 'chapter_id,verse_key,verse_number,page_number,juz_number',
      word_fields:
        'code_v2,text_qpc_hafs,text_uthmani,text_indopak,char_type_name,page_number,line_number',
      mushaf: 1,
      ...params,
      words: 'true'
    }
  });
  return response.data;
};

// ─── Audio ────────────────────────────────────────────────────────────────────
export const fetchReciters = async (): Promise<ListRecitersResponse> => {
  const response = await contentApi.get<ListRecitersResponse>('/resources/chapter_reciters');
  return response.data;
};

export const fetchChapterReciters = async (): Promise<ListChapterRecitersResponse> => {
  const response = await contentApi.get<ListChapterRecitersResponse>('/resources/chapter_reciters');
  return response.data;
};

// Returns only reciters that have verse-level audio (/recitations/:id) —
// a subset of chapter_reciters. IDs that don't exist in /resources/recitations
// will return 404 from fetchVerseAudioFiles and produce no audio.
export const fetchVerseReciters = async (): Promise<ListRecitersResponse> => {
  const [chapterReciters, recitations] = await Promise.all([
    contentApi.get<ListRecitersResponse>('/resources/chapter_reciters'),
    contentApi.get<{ recitations: { id: number }[] }>('/resources/recitations')
  ]);
  const validIds = new Set((recitations.data.recitations ?? []).map((r) => r.id));
  const filtered = (chapterReciters.data.reciters ?? []).filter((r) => validIds.has(r.id));
  return { reciters: filtered };
};

export const fetchChapterAudio = async (
  reciterId: number,
  chapterNumber: number
): Promise<{ audio_file: { audio_url: string } }> => {
  const response = await contentApi.get(`/chapter_recitations/${reciterId}/${chapterNumber}`);
  return response.data;
};

export const fetchVerseAudioFiles = async (
  reciterId: number,
  chapterNumber: number
): Promise<{ verse_key: string; url: string }[]> => {
  const response = await contentApi.get<{
    audio_files: { verse_key: string; url: string }[];
  }>(`/recitations/${reciterId}/by_chapter/${chapterNumber}`, {
    params: { per_page: 300 }
  });
  const CDN = 'https://verses.quran.com/';
  return (response.data.audio_files ?? []).map((f) => ({
    verse_key: f.verse_key,
    url: f.url.startsWith('http')
      ? f.url
      : f.url.startsWith('//')
        ? `https:${f.url}`
        : `${CDN}${f.url}`
  }));
};

// ─── Navigation helpers ───────────────────────────────────────────────────────
export const fetchPages = async (): Promise<ListPagesResponse> => {
  const response = await contentApi.get<ListPagesResponse>('/pages', { params: { mushaf: 1 } });
  return response.data;
};

export const fetchJuzs = async (): Promise<ListJuzsResponse> => {
  const response = await contentApi.get<ListJuzsResponse>('/juzs', { params: { mushaf: 1 } });
  return response.data;
};

export const fetchHizbs = async (): Promise<ListHizbsResponse> => {
  const response = await contentApi.get<ListHizbsResponse>('/hizbs');
  return response.data;
};

export const fetchPageForVerseKey = async (verseKey: string): Promise<number | null> => {
  const response = await contentApi.get<{ pages: Record<string, unknown> }>('/pages/lookup', {
    params: { mushaf: 1, from: verseKey, to: verseKey }
  });
  const firstKey = Object.keys(response.data.pages ?? {})[0];
  return firstKey ? Number(firstKey) : null;
};

// ─── Tajweed ──────────────────────────────────────────────────────────────────
export const fetchTajweedByChapter = async (
  chapterNumber: number
): Promise<Record<string, string>> => {
  const response = await contentApi.get<{
    verses: { verse_key: string; text_uthmani_tajweed: string }[];
  }>('/quran/verses/uthmani_tajweed', { params: { chapter_number: chapterNumber } });
  const map: Record<string, string> = {};
  for (const v of response.data.verses ?? []) {
    map[v.verse_key] = v.text_uthmani_tajweed;
  }
  return map;
};

// ─── Translations ─────────────────────────────────────────────────────────────
export const fetchTranslations = async (chapterNumber: number, resourceId = 131) => {
  const response = await contentApi.get(`/translations/${chapterNumber}`, {
    params: { resource_id: resourceId }
  });
  return response.data;
};

// ─── Random Ayah ──────────────────────────────────────────────────────────────
export const fetchRandomAyah = async (): Promise<RandomAyahResponse> => {
  const response = await contentApi.get<RandomAyahResponse>('/verses/random', {
    params: {
      language: 'en',
      translations: '20',
      fields: 'text_uthmani',
      translation_fields: 'resource_name'
    }
  });
  return response.data;
};
