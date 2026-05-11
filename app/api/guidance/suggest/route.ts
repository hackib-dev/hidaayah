import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const QF_SEARCH_BASE = 'https://apis.quran.foundation/search';
const QF_SEARCH_CLIENT_ID = process.env.QF_SEARCH_CLIENT_ID || '';

const RANKING_PROMPT = `You are ranking Quran verses by relevance to a user's emotional state.

Given:
1. User's situation/emotion
2. List of candidate verses with their keys and translations

Return ONLY a JSON array of the 4 most relevant verse keys in order of relevance.
Format: ["2:286","94:5","13:28","39:53"]

No explanation, no markdown, just the JSON array.`;

// Get search token from QF OAuth
async function getSearchToken(): Promise<string> {
  const credentials = Buffer.from(
    `${QF_SEARCH_CLIENT_ID}:${process.env.QF_SEARCH_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://prelive-oauth2.quran.foundation/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'search'
    })
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  try {
    // Step 1: Get 20 candidate verses from QF search (fast: ~1s)
    const token = await getSearchToken();
    const searchRes = await fetch(
      `${QF_SEARCH_BASE}/v1/search?${new URLSearchParams({
        mode: 'quick',
        query: text.trim(),
        get_text: '1',
        versesResultsNumber: '20'
      })}`,
      {
        headers: {
          'x-client-id': QF_SEARCH_CLIENT_ID,
          'x-auth-token': token
        }
      }
    );

    if (!searchRes.ok) {
      return NextResponse.json({ error: 'Search service unavailable' }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const candidates =
      searchData.result?.verses?.slice(0, 20) || searchData.result?.navigation?.slice(0, 20) || [];

    if (candidates.length === 0) {
      return NextResponse.json({ error: 'No verses found' }, { status: 404 });
    }

    // Step 2: Build candidate list for AI ranking
    const candidateText = candidates
      .map((v: { key: string; name: string }, i: number) => `${i + 1}. ${v.key}: ${v.name}`)
      .join('\n');

    // Step 3: AI ranks top 4 from candidates (fast: ~2-3s)
    const aiRes = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: RANKING_PROMPT },
          {
            role: 'user',
            content: `User situation: ${text.trim()}\n\nCandidate verses:\n${candidateText}\n\nReturn top 4 verse keys as JSON array.`
          }
        ],
        web_access: false
      })
    });

    if (!aiRes.ok) {
      // Fallback: return first 4 candidates if AI fails
      const fallback = candidates.slice(0, 4).map((v: { key: string }) => v.key);
      return NextResponse.json({ verseKeys: fallback });
    }

    const aiData = await aiRes.json();
    const raw: string = aiData.result ?? '';

    // Extract JSON array
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) {
      const fallback = candidates.slice(0, 4).map((v: { key: string }) => v.key);
      return NextResponse.json({ verseKeys: fallback });
    }

    let verseKeys: string[];
    try {
      verseKeys = JSON.parse(match[0]);
    } catch {
      const fallback = candidates.slice(0, 4).map((v: { key: string }) => v.key);
      return NextResponse.json({ verseKeys: fallback });
    }

    // Validate and filter to keys that exist in candidates
    const candidateKeys = new Set(candidates.map((v: { key: string }) => v.key));
    const valid = verseKeys
      .filter((k) => /^\d{1,3}:\d{1,3}$/.test(k) && candidateKeys.has(k))
      .slice(0, 4);

    if (valid.length === 0) {
      const fallback = candidates.slice(0, 4).map((v: { key: string }) => v.key);
      return NextResponse.json({ verseKeys: fallback });
    }

    // Pad with candidates if AI returned fewer than 4
    while (valid.length < 4 && valid.length < candidates.length) {
      const next = candidates[valid.length].key;
      if (!valid.includes(next)) valid.push(next);
    }

    return NextResponse.json({ verseKeys: valid });
  } catch (error) {
    console.error('Guidance suggest error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
