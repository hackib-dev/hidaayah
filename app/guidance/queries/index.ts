import { searchApi, contentApi } from '@/app/apiService/quranFoundationService';
import type {
  SearchParams,
  SearchResponse,
  TafsirResponse,
  ListTafsirsResponse
} from '@/app/guidance/types';

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchQuran = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await searchApi.get<SearchResponse>('/v1/search', { params });
  return response.data;
};

// Convenience: search by emotion/keyword for guidance
export const searchByEmotion = async (
  emotion: string,
  situation?: string
): Promise<SearchResponse> => {
  const query = situation ? `${emotion} ${situation}` : emotion;
  return searchQuran({
    mode: 'quick',
    query,
    get_text: '1',
    highlight: '1',
    versesResultsNumber: 10,
    navigationalResultsNumber: 3
  });
};

// ─── Tafsir Resources ─────────────────────────────────────────────────────────
export const fetchAvailableTafsirs = async (language = 'en'): Promise<ListTafsirsResponse> => {
  const response = await contentApi.get<ListTafsirsResponse>('/resources/tafsirs', {
    params: { language }
  });
  return response.data;
};

// ─── Tafsir by Chapter ────────────────────────────────────────────────────────
// Default resource_id 169 = Tafsir Ibn Kathir (English)
export const fetchTafsirByChapter = async (
  resourceId: number,
  chapterNumber: number,
  page = 1,
  perPage = 10
): Promise<TafsirResponse> => {
  const response = await contentApi.get<TafsirResponse>(
    `/tafsirs/${resourceId}/by_chapter/${chapterNumber}`,
    { params: { page, per_page: perPage, fields: 'verse_number,verse_key' } }
  );
  return response.data;
};

export const fetchTafsirByAyah = async (
  resourceId: number,
  verseKey: string
): Promise<TafsirResponse> => {
  const response = await contentApi.get<TafsirResponse>(
    `/tafsirs/${resourceId}/by_ayah/${verseKey}`,
    { params: { fields: 'verse_number,verse_key' } }
  );
  return response.data;
};

// ─── Tafsir by Verse Key ──────────────────────────────────────────────────────
export const fetchTafsirByVerseKey = async (
  resourceId: number,
  verseKey: string
): Promise<TafsirResponse> => {
  const response = await contentApi.get<TafsirResponse>(
    `/tafsirs/${resourceId}/by_ayah/${verseKey}`
  );
  return response.data;
};
