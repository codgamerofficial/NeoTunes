import { NextResponse } from 'next/server';
import { createClientServer } from '@/lib/supabase-server';
import { sql, ensureDbUser } from '@/lib/db';

function normalizeName(str: string): string {
  return (str || '').toLowerCase().replace(/[^\w]/g, '');
}

function getSafeArtistName(track: any): string {
  if (typeof track.artist === 'string' && track.artist.trim()) return track.artist.trim();
  if (track.artist?.name) return track.artist.name.trim();
  if (Array.isArray(track.artists) && track.artists.length > 0) {
    const first = track.artists[0];
    return typeof first === 'string' ? first : (first.name || 'Unknown Artist');
  }
  return 'Unknown Artist';
}

function getSafeAlbumName(track: any): string {
  if (typeof track.album === 'string' && track.album.trim()) return track.album.trim();
  if (track.album?.name) return track.album.name.trim();
  return '';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('trackId');

  try {
    const supabase = await createClientServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      if (trackId) return NextResponse.json({ liked: false, guest: true });
      return NextResponse.json({ tracks: [], guest: true });
    }

    await ensureDbUser(user);

    if (trackId) {
      // Check if specific track is liked
      const result = await sql`
        SELECT 1 FROM public.liked_tracks
        WHERE user_id = ${user.id} AND track_id = ${trackId}
      `;
      return NextResponse.json({ liked: result.length > 0 });
    }

    // List all liked tracks
    const likedTracks = await sql`
      SELECT 
        t.id, 
        t.title, 
        t.duration_ms as "durationMs", 
        t.popularity, 
        t.preview_url as "previewUrl",
        a.id as artist_id,
        a.name as artist_name,
        al.id as album_id,
        al.name as album_name,
        al.images as album_images,
        ts.source_type as "sourceType",
        ts.source_id as "sourceId"
      FROM public.liked_tracks lt
      JOIN public.tracks t ON lt.track_id = t.id
      JOIN public.artists a ON t.artist_id = a.id
      LEFT JOIN public.albums al ON t.album_id = al.id
      LEFT JOIN public.track_sources ts ON t.id = ts.track_id
      WHERE lt.user_id = ${user.id}
      ORDER BY lt.created_at DESC
    `;

    const formattedTracks = likedTracks.map((row: any) => {
      let coverUrl = '';
      if (row.album_images) {
        try {
          const imgs = typeof row.album_images === 'string' ? JSON.parse(row.album_images) : row.album_images;
          coverUrl = imgs?.[0]?.url || '';
        } catch {
          // ignore
        }
      }

      return {
        id: row.id,
        title: row.title,
        artist: {
          id: row.artist_id,
          name: row.artist_name,
        },
        album: {
          id: row.album_id,
          name: row.album_name,
          coverUrl,
        },
        durationMs: row.durationMs || 0,
        popularity: row.popularity || 0,
        previewUrl: row.previewUrl || '',
        sourceType: (row.sourceType as 'youtube' | 'cloud') || 'youtube',
        sourceId: row.sourceId || undefined,
        coverUrl,
      };
    });

    return NextResponse.json({ tracks: formattedTracks });
  } catch (error: any) {
    // If DB is offline or table missing, return empty tracks rather than 500
    return NextResponse.json({ tracks: [], error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClientServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, guest: true });
    }

    await ensureDbUser(user);

    const { trackId, track } = await request.json();
    if (!trackId || !track) {
      return NextResponse.json({ error: 'Missing track details' }, { status: 400 });
    }

    const artistName = getSafeArtistName(track);
    const artistId = (typeof track.artist === 'object' && track.artist?.id) ? track.artist.id : `local_${normalizeName(artistName)}`;
    
    const GENERIC_ALBUM_NAMES = ['youtube video', 'unknown album', 'single', ''];
    const rawAlbumName = getSafeAlbumName(track);
    const isGenericAlbum = GENERIC_ALBUM_NAMES.includes(rawAlbumName.toLowerCase().trim());
    const albumId = (typeof track.album === 'object' && track.album?.id) ? track.album.id : (rawAlbumName && !isGenericAlbum ? `local_${normalizeName(rawAlbumName)}` : null);
    const coverUrl = track.coverUrl || track.artworkUrl || (typeof track.album === 'object' ? track.album?.coverUrl : '') || '';

    // 1. Ensure artist exists
    await sql`
      INSERT INTO public.artists (id, name)
      VALUES (${artistId}, ${artistName})
      ON CONFLICT (id) DO NOTHING
    `;

    // 2. Ensure album exists (if applicable)
    if (albumId && rawAlbumName) {
      const albumImages = coverUrl ? [{ url: coverUrl }] : [];
      await sql`
        INSERT INTO public.albums (id, name, artist_id, images)
        VALUES (${albumId}, ${rawAlbumName}, ${artistId}, ${JSON.stringify(albumImages)})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // 3. Ensure track exists
    await sql`
      INSERT INTO public.tracks (id, title, artist_id, album_id, duration_ms, popularity, preview_url)
      VALUES (
        ${track.id}, 
        ${track.title || 'Untitled Track'}, 
        ${artistId}, 
        ${albumId}, 
        ${track.durationMs || (track.duration ? track.duration * 1000 : 0)}, 
        ${track.popularity || 0}, 
        ${track.previewUrl || ''}
      )
      ON CONFLICT (id) DO NOTHING
    `;

    // 4. Ensure track source is resolved (if applicable)
    if (track.sourceId) {
      await sql`
        INSERT INTO public.track_sources (track_id, source_type, source_id)
        VALUES (${track.id}, ${track.sourceType || track.source || 'youtube'}, ${track.sourceId})
        ON CONFLICT (track_id, source_type) DO UPDATE 
        SET source_id = EXCLUDED.source_id
      `;
    }

    // 5. Create Like association
    await sql`
      INSERT INTO public.liked_tracks (user_id, track_id)
      VALUES (${user.id}, ${track.id})
      ON CONFLICT (user_id, track_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClientServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: true, guest: true });
    }

    await ensureDbUser(user);

    const { trackId } = await request.json();
    if (!trackId) {
      return NextResponse.json({ error: 'Missing trackId' }, { status: 400 });
    }

    await sql`
      DELETE FROM public.liked_tracks
      WHERE user_id = ${user.id} AND track_id = ${trackId}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}
