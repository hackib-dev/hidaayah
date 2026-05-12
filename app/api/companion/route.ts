import { NextRequest, NextResponse } from 'next/server';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: 'No message provided' }, { status: 400 });
  }

  try {
    const messages = [
      { role: 'system', content: 'You are a warm, knowledgeable Quran companion.' },
      ...(history || []),
      { role: 'user', content: message.trim() }
    ];

    // Use Groq if available, fallback to RapidAPI
    const useGroq = !!GROQ_API_KEY;

    let response;
    if (useGroq) {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: messages.slice(-10),
          temperature: 0.7,
          max_tokens: 500
        })
      });
    } else {
      response = await fetch('https://open-ai21.p.rapidapi.com/conversationllama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY
        },
        body: JSON.stringify({
          messages: messages.slice(-10),
          web_access: false
        })
      });
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const reply = useGroq
      ? (data.choices?.[0]?.message?.content ?? 'I apologize, I could not process that request.')
      : (data.result ?? 'I apologize, I could not process that request.');

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Companion error:', error);
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 });
  }
}
