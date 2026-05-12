import { searchApi, contentApi } from '@/app/apiService/quranFoundationService';
import type {
  SearchParams,
  SearchResponse,
  TafsirResponse,
  ListTafsirsResponse
} from '@/app/(app)/dashboard/guidance/types';

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchQuran = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await searchApi.get<SearchResponse>('/v1/search', { params });
  return response.data;
};

// Maps common emotions to richer Quranic keyword synonyms for better search recall
const EMOTION_KEYWORDS: Record<string, string[]> = {
  anxious: ['anxiety', 'fear', 'worry', 'trust', 'tawakkul', 'relief'],
  grateful: ['gratitude', 'thankful', 'shukr', 'blessing', 'praise'],
  lost: ['guidance', 'hidayah', 'direction', 'path', 'light'],
  hopeful: ['hope', 'mercy', 'rahma', 'promise', 'patient'],
  struggling: ['patience', 'sabr', 'hardship', 'ease', 'strength'],
  peaceful: ['peace', 'salam', 'tranquility', 'contentment', 'heart'],
  sad: ['comfort', 'grief', 'sorrow', 'mercy', 'relief'],
  angry: ['patience', 'forgiveness', 'control', 'calm', 'justice'],
  lonely: ['company', 'nearness', 'Allah', 'love', 'connection'],
  confused: ['clarity', 'wisdom', 'guidance', 'understanding', 'light']
};

function buildSearchQuery(emotion: string, situation?: string): string {
  const key = emotion.toLowerCase().trim();
  const keywords = EMOTION_KEYWORDS[key] ?? [];
  // Use the top 2 synonyms to widen recall without diluting relevance
  const enriched = keywords.slice(0, 2);
  const parts = [emotion, ...enriched];
  if (situation) {
    // Extract meaningful words from situation (skip stop words)
    const stopWords = new Set([
      'i',
      'am',
      'is',
      'are',
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'my',
      'me',
      'it',
      'so',
      'do',
      'not',
      'be',
      'have',
      'that',
      'this'
    ]);
    const situationWords = situation
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .slice(0, 3);
    parts.push(...situationWords);
  }
  return [...new Set(parts)].join(' ');
}

// Convenience: search by emotion/keyword for guidance, returns multiple verse candidates
export const searchByEmotion = async (
  emotion: string,
  situation?: string
): Promise<SearchResponse> => {
  const query = buildSearchQuery(emotion, situation);

  // Quick mode first — returns navigational + verse results fast
  const quickRes = await searchQuran({
    mode: 'quick',
    query,
    get_text: '1',
    highlight: '1',
    versesResultsNumber: 20,
    navigationalResultsNumber: 5
  });

  const verseCount = quickRes.result?.verses?.length ?? 0;

  // Fall back to advanced mode with a popular English translation if quick returns sparse verses
  if (verseCount < 3) {
    const advancedRes = await searchQuran({
      mode: 'advanced',
      query,
      get_text: '1',
      highlight: '1',
      translation_ids: '131',
      size: 20,
      page: 1
    }).catch(() => null);

    if (advancedRes && (advancedRes.result?.verses?.length ?? 0) > verseCount) {
      // Merge: keep navigation from quick, use verses from advanced
      return {
        ...advancedRes,
        result: {
          navigation: quickRes.result?.navigation ?? [],
          verses: advancedRes.result?.verses ?? []
        }
      };
    }
  }

  return quickRes;
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
