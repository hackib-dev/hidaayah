import { contentApi } from '@/app/apiService/quranFoundationService';
import type {
  ListChaptersResponse,
  ListVersesResponse,
  GetVerseResponse,
  ListVersesParams,
  ListRecitersResponse
} from '@/app/quran/types';

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
      translations: '131', // Sahih International (English) — default
      ...params,
      words: params.words !== undefined ? (params.words ? 'true' : 'false') : 'true'
    }
  });
  return response.data;
};

// ─── Audio ────────────────────────────────────────────────────────────────────
export const fetchReciters = async (): Promise<ListRecitersResponse> => {
  const response = await contentApi.get<ListRecitersResponse>('/resources/recitations');
  return response.data;
};

export const fetchChapterAudio = async (
  reciterId: number,
  chapterNumber: number
): Promise<{ audio_file: { audio_url: string } }> => {
  const response = await contentApi.get(`/chapter_recitations/${reciterId}/${chapterNumber}`);
  return response.data;
};

// ─── Translations ─────────────────────────────────────────────────────────────
export const fetchTranslations = async (chapterNumber: number, resourceId = 131) => {
  const response = await contentApi.get(`/translations/${chapterNumber}`, {
    params: { resource_id: resourceId }
  });
  return response.data;
};
