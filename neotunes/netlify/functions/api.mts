import { Buffer } from "node:buffer";

type Track = {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  color?: string;
  source: "youtube" | "jamendo" | "spotify_metadata";
  url?: string;
  duration_ms?: number;
  searchQuery?: string;
  album?: string;
  releaseDate?: string;
  spotifyUrl?: string;
  popularity?: number;
  metadataProvider?: "spotify";
};

type NetlifyGlobal = typeof globalThis & {
  Netlify?: {
    env?: {
      get(name: string): string | undefined;
    };
  };
};

const BLOCK_COLORS = ["#7B61FF", "#00D4FF", "#00FF85", "#FF6B6B", "#FFD700", "#FF4ECD"];
const CURRENT_YEAR = new Date().getFullYear();

const RECOMMENDATION_QUERIES: Record<string, string> = {
  focus: "lofi focus instrumental study",
  chill: "chill vibes mellow pop",
  gym: "workout motivation high energy",
  party: `party hits ${CURRENT_YEAR}`,
  global: `top hits ${CURRENT_YEAR} global`,
  india: `bollywood hits ${CURRENT_YEAR} india`,
};

let spotifyToken: string | null = null;
let tokenExpiration = 0;

function readEnv(name: string) {
  const netlifyValue = (globalThis as NetlifyGlobal).Netlify?.env?.get(name);
  return netlifyValue || process.env[name] || "";
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

async function readError(response: Response) {
  try {
    return await response.text();
  } catch {
    return response.statusText;
  }
}

function endpointFromRequest(request: Request) {
  const pathname = new URL(request.url).pathname;
  return pathname
    .replace(/^\/api\/?/, "")
    .replace(/^\/\.netlify\/functions\/api\/?/, "")
    .replace(/^\/+/, "")
    .split("/")[0];
}

async function searchYouTube(query: string, maxResults = 10): Promise<Track[]> {
  const apiKey = readEnv("YOUTUBE_API_KEY") || readEnv("EXPO_PUBLIC_YOUTUBE_API_KEY");
  if (!apiKey) {
    console.warn("YOUTUBE_API_KEY or EXPO_PUBLIC_YOUTUBE_API_KEY is not configured.");
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    maxResults: String(maxResults),
    q: query,
    type: "video",
    videoCategoryId: "10",
    key: apiKey,
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!response.ok) {
    console.error("YouTube API Error:", await readError(response));
    return [];
  }

  const data = await response.json();
  if (!Array.isArray(data.items)) return [];

  return data.items.map((item: any, index: number) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    artwork: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url || "",
    color: BLOCK_COLORS[index % BLOCK_COLORS.length],
    source: "youtube",
  }));
}

async function searchJamendo(query: string, limit = 10): Promise<Track[]> {
  const clientId = readEnv("JAMENDO_CLIENT_ID") || "b6747d04";
  const params = new URLSearchParams({
    client_id: clientId,
    format: "json",
    limit: String(limit),
    search: query,
    include: "musicinfo",
    audioformat: "mp32",
  });

  const response = await fetch(`https://api.jamendo.com/v3.0/tracks/?${params}`);
  if (!response.ok) {
    console.error("Jamendo API Error:", await readError(response));
    return [];
  }

  const data = await response.json();
  if (!Array.isArray(data.results)) return [];

  return data.results.map((item: any, index: number) => ({
    id: String(item.id),
    title: item.name,
    artist: item.artist_name,
    artwork: item.image,
    color: BLOCK_COLORS[index % BLOCK_COLORS.length],
    source: "jamendo",
    url: item.audio,
  }));
}

async function getSpotifyToken() {
  if (spotifyToken && Date.now() < tokenExpiration) return spotifyToken;

  const clientId = readEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = readEnv("SPOTIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    console.warn("SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET is not configured.");
    return null;
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    console.error("Spotify token error:", await readError(response));
    return null;
  }

  const data = await response.json();
  spotifyToken = data.access_token;
  tokenExpiration = Date.now() + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

async function searchSpotify(query: string, limit = 10): Promise<Track[]> {
  const token = await getSpotifyToken();
  if (!token) return [];
  const spotifyLimit = Math.max(1, Math.min(limit, 10));

  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(spotifyLimit),
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.error("Spotify Search Error:", await readError(response));
    return [];
  }

  const data = await response.json();
  const tracks = data.tracks?.items;
  if (!Array.isArray(tracks)) return [];

  return tracks.map((item: any, index: number) => ({
    id: `spot_${item.id}`,
    title: item.name,
    artist: item.artists[0]?.name || "Unknown artist",
    artwork: item.album.images[0]?.url || "",
    album: item.album.name,
    releaseDate: item.album.release_date,
    spotifyUrl: item.external_urls?.spotify,
    duration_ms: item.duration_ms,
    color: BLOCK_COLORS[index % BLOCK_COLORS.length],
    source: "spotify_metadata",
    metadataProvider: "spotify",
    searchQuery: `${item.name} ${item.artists[0]?.name || ""} official audio`,
  }));
}

async function handleSearch(url: URL) {
  const query = url.searchParams.get("q");
  const source = url.searchParams.get("source") || "all";
  if (!query) return json({ error: 'Missing query parameter "q"' }, 400);

  const [spotifyResults, jamendoResults, youtubeResults] = await Promise.all([
    source === "all" || source === "spotify" ? searchSpotify(query) : Promise.resolve([]),
    source === "all" || source === "jamendo" ? searchJamendo(query) : Promise.resolve([]),
    source === "all" || source === "youtube" ? searchYouTube(query) : Promise.resolve([]),
  ]);

  const results = [...spotifyResults, ...jamendoResults, ...youtubeResults];

  return json(results);
}

async function handleTrending(url: URL) {
  const region = url.searchParams.get("region") || "global";
  const query = region === "global" ? RECOMMENDATION_QUERIES.global : RECOMMENDATION_QUERIES.india;
  const spotifyTracks = await searchSpotify(query, 10);
  if (spotifyTracks.length > 0) return json(spotifyTracks);

  return json(await searchYouTube(query, 15));
}

async function handleRecommendations(url: URL) {
  const mood = (url.searchParams.get("mood") || "chill").toLowerCase();
  const query = RECOMMENDATION_QUERIES[mood] || RECOMMENDATION_QUERIES.chill;
  const spotifyTracks = await searchSpotify(query, 10);
  if (spotifyTracks.length > 0) return json(spotifyTracks);

  return json(await searchYouTube(query, 12));
}

async function handleResolve(url: URL) {
  const searchQuery = url.searchParams.get("searchQuery");
  if (!searchQuery) return json({ error: "Missing searchQuery" }, 400);

  const tracks = await searchYouTube(searchQuery, 1);
  if (tracks.length === 0) {
    return json({ error: "Could not resolve audio for track." }, 404);
  }

  return json({ url: null, id: tracks[0].id, resolvedSource: "youtube" });
}

export default async (request: Request) => {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = new URL(request.url);
  const endpoint = endpointFromRequest(request);

  try {
    if (endpoint === "search") return await handleSearch(url);
    if (endpoint === "trending") return await handleTrending(url);
    if (endpoint === "recommendations") return await handleRecommendations(url);
    if (endpoint === "resolve") return await handleResolve(url);

    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("NeoTunes API Error:", error);
    return json({ error: "Failed to process request" }, 500);
  }
};

export const config = {
  path: "/api/*",
};
