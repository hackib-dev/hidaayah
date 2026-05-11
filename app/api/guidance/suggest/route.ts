import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

const SYSTEM_PROMPT = `You are a Quran guidance assistant with deep knowledge of all 6236 verses across all 114 surahs.

When given a user's emotional state or situation, return ONLY a valid JSON array of exactly 4 Quran verse keys that are most spiritually relevant and comforting for their specific situation.

Rules:
- Return ONLY the JSON array, no explanation, no markdown, no extra text
- Use format: ["2:286","94:5","13:28","39:53"]
- Choose verses that directly address the emotion or situation described
- Draw from the full Quran, not just well-known verses
- Prioritise verses with clear, comforting meaning in English translation`;

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  const response = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
      'x-rapidapi-key': RAPIDAPI_KEY
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text.trim() }
      ],
      web_access: false
    })
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
  }

  const data = await response.json();
  const raw: string = data.result ?? '';

  // Extract JSON array — handles cases where model adds surrounding text
  const match = raw.match(/\[[\s\S]*?\]/);
  if (!match) {
    return NextResponse.json({ error: 'Invalid AI response' }, { status: 502 });
  }

  let verseKeys: string[];
  try {
    verseKeys = JSON.parse(match[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to parse verse keys' }, { status: 502 });
  }

  // Validate each key is "chapter:verse" format
  const valid = verseKeys.filter((k) => /^\d{1,3}:\d{1,3}$/.test(k)).slice(0, 4);

  if (valid.length === 0) {
    return NextResponse.json({ error: 'No valid verse keys returned' }, { status: 502 });
  }

  return NextResponse.json({ verseKeys: valid });
}
