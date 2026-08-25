import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const prompt = url.searchParams.get('prompt') || url.searchParams.get('q') || 'trending music';
  return handleCopilot(prompt, [], request);
}

export async function POST(request: Request) {
  let prompt = '';
  let history: any[] = [];
  let currentTrack: any = null;
  let activeContext: string = '';

  try {
    const text = await request.text();
    if (text && text.trim().length > 0) {
      const body = JSON.parse(text);
      prompt = body.prompt || body.message || '';
      history = body.history || [];
      currentTrack = body.currentTrack || null;
      activeContext = body.activeContext || '';
    }
  } catch {
    prompt = 'trending music';
  }

  return handleCopilot(prompt, history, request, currentTrack, activeContext);
}

async function handleCopilot(
  prompt: string, 
  history: any[], 
  request: Request,
  currentTrack?: any,
  activeContext?: string
) {
  try {
    const cleanPrompt = prompt.trim() || 'trending music';
    const nvidiaApiKey = process.env.NVIDIA_AI_KEY || process.env.AI_API_KEY || '';

    // System prompt instructing LLM as Neo Music Intelligence Agent
    const systemPrompt = `You are Neo, the music intelligence agent for NeoTunes platform.
Context: ${activeContext ? `User is currently viewing: ${activeContext}` : 'Home feed'}.
Active Track: ${currentTrack ? `${currentTrack.title} by ${typeof currentTrack.artist === 'object' ? currentTrack.artist.name : currentTrack.artist}` : 'None'}.

User prompt: "${cleanPrompt}"

Understand user intent and generate a warm, concise music intelligence response.
Possible Intents: "PLAY", "CREATE_PLAYLIST", "RECOMMEND", "ADD_QUEUE", "LIKE", "SURPRISE_ME", "START_JAM", "EXPLAIN", "ANALYZE_HISTORY".

Respond STRICTLY in valid JSON:
{
  "intent": "PLAY" | "CREATE_PLAYLIST" | "RECOMMEND" | "ADD_QUEUE" | "LIKE" | "SURPRISE_ME" | "START_JAM" | "EXPLAIN" | "ANALYZE_HISTORY",
  "searchQuery": "clean search string for music database query",
  "reply": "Warm, human 1-2 sentence explanation of your recommendation/action",
  "playlistTitle": "Hero title if creating mix/playlist, otherwise null",
  "playlistDescription": "Short description of mix if applicable, otherwise null",
  "tags": ["Tag 1", "Tag 2", "Tag 3", "Tag 4"],
  "suggestedPrompts": ["Prompt 1", "Prompt 2", "Prompt 3"]
}`;

    let llmJson: any = null;

    if (nvidiaApiKey) {
      try {
        const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nvidiaApiKey}`,
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-70b-instruct',
            messages: [
              { role: 'system', content: systemPrompt },
              ...history.slice(-4).map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: typeof h.content === 'string' ? h.content : h.text || '',
              })),
              { role: 'user', content: cleanPrompt },
            ],
            temperature: 0.5,
            max_tokens: 500,
          }),
        });

        if (nvidiaRes.ok) {
          const nvidiaData = await nvidiaRes.json();
          const rawContent = nvidiaData.choices?.[0]?.message?.content || '';
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            llmJson = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (e) {
        console.warn('AI Provider fallback:', e);
      }
    }

    // Deterministic Music Intelligence Fallback Engine
    if (!llmJson) {
      const lower = cleanPrompt.toLowerCase();
      let intent = 'RECOMMEND';
      let targetQuery = cleanPrompt;
      let reply = `I've put together a curated selection matching "${cleanPrompt}".`;
      let playlistTitle: string | null = null;
      let playlistDesc: string | null = null;
      let tags = ['✨ Curated Pick', '🎧 High Fidelity'];

      if (lower.includes('surprise') || lower.includes('unexpected')) {
        intent = 'SURPRISE_ME';
        targetQuery = 'Bengali Indie';
        reply = "Here's an unexpected pick outside your usual rotation that I think you'll love.";
        tags = ['🎲 Discovery', '🌊 Fresh Vibe', '✨ High Match Score'];
      } else if (lower.includes('rainy') || lower.includes('night') || lower.includes('late')) {
        intent = 'CREATE_PLAYLIST';
        targetQuery = 'Arijit Singh Bengali Hindi';
        playlistTitle = 'Late Night — Bengali × Hindi';
        playlistDesc = 'A warm mix of soft vocals and mellow production for quiet evenings.';
        reply = 'I built a 42-minute late-night mix with soft vocals, warm production, and low-energy melodies.';
        tags = ['🌙 Low energy', '🎙 Vocal-focused', '🇮🇳 Bengali + Hindi', '✨ 4 new discoveries'];
      } else if (lower.includes('workout') || lower.includes('gym') || lower.includes('hype')) {
        intent = 'CREATE_PLAYLIST';
        targetQuery = 'Punjabi Hip-Hop EDM Workout';
        playlistTitle = 'High-Voltage Workout';
        playlistDesc = 'Energetic beats to push your gym intensity.';
        reply = 'Here is a high-bpm workout mix to get your energy pumping.';
        tags = ['⚡ High BPM', '🏋️ Gym Ready', '🔥 Heavy Bass'];
      } else if (lower.includes('jam')) {
        intent = 'START_JAM';
        reply = 'Your NeoTunes Jam room is ready. Invite friends to listen together in sync!';
        tags = ['📻 Synchronized', '👥 Multi-User', '⚡ Real-Time'];
      } else if (/play\s+(.+)/i.test(lower)) {
        intent = 'PLAY';
        const match = lower.match(/play\s+(.+)/i);
        targetQuery = match ? match[1] : cleanPrompt;
        reply = `Starting playback for "${targetQuery}".`;
        tags = ['▶ Direct Playback', '🎧 Preferred Source'];
      } else if (/badshah|arijit|weeknd|coldplay|diljit/i.test(lower)) {
        intent = 'RECOMMEND';
        targetQuery = cleanPrompt;
        reply = `Here are the top tracks and recommended hits for ${cleanPrompt}.`;
        tags = ['🔥 Popular Hits', '🎙 Top Artist'];
      }

      llmJson = {
        intent,
        searchQuery: targetQuery,
        reply,
        playlistTitle,
        playlistDescription: playlistDesc,
        tags,
        suggestedPrompts: ['Play something like this', 'Surprise me', 'Make a workout mix'],
      };
    }

    // Resolve candidates via unified Search Engine
    const targetQuery = llmJson.searchQuery || cleanPrompt;
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3002';
    const searchApiUrl = `${protocol}://${host}/api/search?q=${encodeURIComponent(targetQuery)}`;

    let tracks: any[] = [];
    try {
      const searchRes = await fetch(searchApiUrl);
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        tracks = searchData.songs || searchData.tracks || [];
      }
    } catch {}

    if (tracks.length === 0) {
      // Direct query fallback via internal service
      try {
        const fallbackRes = await fetch(`${protocol}://${host}/api/search?q=${encodeURIComponent('Trending Hits 2026')}`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          tracks = fallbackData.songs || fallbackData.tracks || [];
        }
      } catch {}
    }

    // Limit cards to 4 strongest recommendations per spec
    const topTracks = tracks.slice(0, 4);

    return NextResponse.json({
      intent: llmJson.intent || 'RECOMMEND',
      reply: llmJson.reply,
      playlistTitle: llmJson.playlistTitle || null,
      playlistDescription: llmJson.playlistDescription || null,
      tags: llmJson.tags || ['✨ Curated Pick', '🎧 High Fidelity'],
      tracks: topTracks,
      suggestedPrompts: llmJson.suggestedPrompts || ['Surprise me', 'Play something like this', 'Make a late-night mix'],
      source: 'NeoTunes Music Intelligence Engine',
    });

  } catch (error: any) {
    console.error('Error in Neo Copilot API:', error);
    return NextResponse.json({
      intent: 'RECOMMEND',
      reply: 'Neo Music Intelligence is ready. Search for songs, artists, or moods.',
      tracks: [],
      tags: ['✨ Music Assistant'],
      source: 'NeoTunes Core',
    });
  }
}
