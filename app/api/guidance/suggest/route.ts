import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

const GUIDANCE_PROMPT = `You are a compassionate Islamic scholar helping someone find Quranic guidance.

Analyze the user's situation and select 4 relevant Quran verses from this curated list:

2:286 - Allah does not burden a soul beyond its capacity (patience, strength)
94:5 - With hardship comes ease (hope, difficulty)
94:6 - Indeed with hardship comes ease (perseverance)
13:28 - Hearts find peace in remembrance of Allah (peace, anxiety)
39:53 - Do not despair of Allah's mercy (forgiveness, hope)
2:186 - I am near, I respond to the caller (prayer, connection)
14:7 - If you are grateful, I will increase you (gratitude, blessings)
16:18 - Allah's blessings are countless (gratitude, awareness)
3:139 - Do not lose hope, you will be superior (strength, faith)
29:2 - Do people think they will not be tested? (trials, patience)
2:153 - Seek help through patience and prayer (guidance, support)
20:123 - Whoever follows My guidance will not go astray (direction, clarity)
65:3 - Allah provides from unexpected sources (trust, provision)
39:23 - The best speech is the Book of Allah (guidance, wisdom)
16:97 - Whoever does good will have a good life (righteousness, peace)
89:27 - O peaceful soul, return to your Lord (contentment, peace)
55:13 - Which favors of your Lord will you deny? (gratitude, reflection)
27:40 - This is from the grace of my Lord (gratitude, humility)
93:7 - He found you lost and guided you (guidance, direction)
2:155 - We will test you with fear, hunger, loss (patience, trials)
3:160 - If Allah helps you, none can overcome you (trust, victory)
25:70 - Allah will replace their evil deeds with good (repentance, hope)

Return ONLY a JSON array of 4 verse keys most relevant to their situation.
Format: ["2:286","94:5","13:28","39:53"]

No explanation, just the array.`;

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  const fallbackVerses = ['2:286', '94:5', '13:28', '39:53'];

  try {
    // Try Groq first (better quality, free)
    if (GROQ_API_KEY) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: GUIDANCE_PROMPT },
              { role: 'user', content: text.trim() }
            ],
            temperature: 0.3,
            max_tokens: 100
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data.choices?.[0]?.message?.content || '';
          const match = content.match(/\[[\s\S]*?\]/);
          if (match) {
            const verseKeys: string[] = JSON.parse(match[0]);
            const valid = verseKeys.filter((k) => /^\d{1,3}:\d{1,3}$/.test(k)).slice(0, 4);
            if (valid.length >= 3) {
              console.log('✓ Groq AI selected verses:', valid);
              return NextResponse.json({ verseKeys: valid });
            }
          }
        }
      } catch (e) {
        console.warn('Groq failed, trying RapidAPI');
      }
    }

    // Fallback to RapidAPI
    if (RAPIDAPI_KEY) {
      const aiRes = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: GUIDANCE_PROMPT },
            { role: 'user', content: text.trim() }
          ],
          web_access: false
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const raw: string = aiData.result ?? '';
        const match = raw.match(/\[[\s\S]*?\]/);
        if (match) {
          const verseKeys: string[] = JSON.parse(match[0]);
          const valid = verseKeys.filter((k) => /^\d{1,3}:\d{1,3}$/.test(k)).slice(0, 4);
          if (valid.length >= 3) {
            console.log('✓ RapidAPI selected verses:', valid);
            return NextResponse.json({ verseKeys: valid });
          }
        }
      }
    }

    console.log('✓ Using fallback verses');
    return NextResponse.json({ verseKeys: fallbackVerses });
  } catch (error) {
    console.error('Guidance error:', error);
    return NextResponse.json({ verseKeys: fallbackVerses });
  }
}
