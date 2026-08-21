/**
 * Centralized Environment Validation & Safe Configuration Loader
 * Handles Required vs Optional services cleanly without crashing the application.
 */

interface EnvConfig {
  siteUrl: string;
  port: number;
  nodeEnv: string;
  supabase: {
    url: string | null;
    anonKey: string | null;
    serviceRoleKey: string | null;
    isAvailable: boolean;
  };
  spotify: {
    clientId: string | null;
    clientSecret: string | null;
    isAvailable: boolean;
  };
  youtube: {
    apiKey: string | null;
    isAvailable: boolean;
  };
  openRouter: {
    apiKey: string | null;
    isAvailable: boolean;
  };
  nvidia: {
    apiKey: string | null;
    isAvailable: boolean;
  };
}

function safeGetEnv(key: string, defaultValue: string = ''): string {
  if (typeof process === 'undefined' || !process.env) return defaultValue;
  return process.env[key] || defaultValue;
}

export const env: EnvConfig = (() => {
  const supabaseUrl = safeGetEnv('NEXT_PUBLIC_SUPABASE_URL') || safeGetEnv('SUPABASE_URL');
  const supabaseAnonKey = safeGetEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || safeGetEnv('SUPABASE_ANON_KEY');
  const supabaseServiceKey = safeGetEnv('SUPABASE_SERVICE_ROLE_KEY');

  const spotifyClientId = safeGetEnv('SPOTIFY_CLIENT_ID');
  const spotifyClientSecret = safeGetEnv('SPOTIFY_CLIENT_SECRET');

  const youtubeApiKey = safeGetEnv('YOUTUBE_API_KEY');
  const openRouterApiKey = safeGetEnv('OPENROUTER_API_KEY');
  const nvidiaApiKey = safeGetEnv('NVIDIA_AI_KEY') || safeGetEnv('NEXT_PUBLIC_NVIDIA_AI_KEY');

  return {
    siteUrl: safeGetEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3001'),
    port: parseInt(safeGetEnv('PORT', '3001'), 10),
    nodeEnv: safeGetEnv('NODE_ENV', 'development'),

    supabase: {
      url: supabaseUrl || null,
      anonKey: supabaseAnonKey || null,
      serviceRoleKey: supabaseServiceKey || null,
      isAvailable: Boolean(supabaseUrl && supabaseAnonKey),
    },

    spotify: {
      clientId: spotifyClientId || null,
      clientSecret: spotifyClientSecret || null,
      isAvailable: Boolean(spotifyClientId && spotifyClientSecret),
    },

    youtube: {
      apiKey: youtubeApiKey || null,
      isAvailable: Boolean(youtubeApiKey),
    },

    openRouter: {
      apiKey: openRouterApiKey || null,
      isAvailable: Boolean(openRouterApiKey),
    },

    nvidia: {
      apiKey: nvidiaApiKey || null,
      isAvailable: Boolean(nvidiaApiKey),
    },
  };
})();
