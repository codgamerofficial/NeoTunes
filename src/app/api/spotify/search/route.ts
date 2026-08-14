import { NextResponse } from 'next/server';
import { spotifyProvider } from '@/services/providers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);
  const market = searchParams.get('market') || 'IN';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter "q" is required.' }, { status: 400 });
  }

  try {
    const results = await spotifyProvider.search(query, { limit, offset, market });
    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Spotify search failed' }, { status: 500 });
  }
}

