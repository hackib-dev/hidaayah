import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const QF_CONTENT_CLIENT_ID = process.env.QF_CONTENT_CLIENT_ID || '';

async function getContentToken(): Promise<string> {
  const credentials = Buffer.from(
    `${QF_CONTENT_CLIENT_ID}:${process.env.QF_CONTENT_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://oauth2.quran.foundation/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  });

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  const { type, difficulty } = await req.json();

  try {
    // Get random verse from QF
    const token = await getContentToken();
    const verseRes = await fetch(
      'https://apis.quran.foundation/content/api/v4/verses/random?translations=20&fields=text_uthmani',
      {
        headers: {
          'x-client-id': QF_CONTENT_CLIENT_ID,
          'x-auth-token': token
        }
      }
    );

    const verseData = await verseRes.json();
    const verse = verseData.verse;
    const arabic = verse.text_uthmani;
    const translation = verse.translations?.[0]?.text?.replace(/<[^>]*>/g, '') ?? '';
    const verseKey = verse.verse_key;

    // Generate challenge using AI
    let prompt = '';
    if (type === 'complete') {
      prompt = `Given this Quran verse:
Arabic: ${arabic}
Translation: ${translation}

Create a "complete the ayah" challenge. Return ONLY a JSON object:
{
  "question": "First part of the ayah in Arabic",
  "answer": "Missing part of the ayah in Arabic",
  "hint": "Brief hint in English"
}

Make the question ${difficulty === 'easy' ? 'the first 40%' : difficulty === 'medium' ? 'the first 60%' : 'the first 70%'} of the ayah.`;
    } else if (type === 'arrange') {
      prompt = `Given this Quran verse:
Arabic: ${arabic}

Create an "arrange the words" challenge. Return ONLY a JSON object:
{
  "words": ["array", "of", "scrambled", "Arabic", "words"],
  "answer": "correct order as space-separated string"
}

Scramble the words randomly.`;
    } else {
      prompt = `Given this Quran verse:
Arabic: ${arabic}
Translation: ${translation}

Create a "missing word" challenge. Return ONLY a JSON object:
{
  "question": "Ayah with one word replaced by ___",
  "answer": "The missing Arabic word",
  "options": ["correct answer", "3 similar wrong options"]
}`;
    }

    const aiRes = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a Quran memorization assistant. Return only valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        web_access: false
      })
    });

    const aiData = await aiRes.json();
    const raw = aiData.result ?? '';

    const match = raw.match(/\{[\s\S]*?\}/);
    if (!match) {
      return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
    }

    const challengeData = JSON.parse(match[0]);

    return NextResponse.json({
      id: `${Date.now()}-${type}`,
      type,
      verseKey,
      surahName: `Surah ${verseKey.split(':')[0]}`,
      difficulty,
      ...challengeData
    });
  } catch (error) {
    console.error('Challenge generation error:', error);
    return NextResponse.json({ error: 'Failed to generate challenge' }, { status: 500 });
  }
}
