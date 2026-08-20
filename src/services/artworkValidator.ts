const TRUSTED_ARTWORK_DOMAINS = [
  'mzstatic.com',
  'scdn.co',
  'ytimg.com',
  'ggpht.com',
  'deezer.com',
  'spotify.com',
  'musicbrainz.org',
  'coverartarchive.org',
  'cloudinary.com',
  'unsplash.com',
];

export async function validateArtworkUrl(url: string, timeoutMs: number = 4000): Promise<boolean> {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return false;
  }

  // Fast-path for trusted CDN domains
  const isTrustedDomain = TRUSTED_ARTWORK_DOMAINS.some((domain) => url.includes(domain));
  if (isTrustedDomain) {
    return true;
  }

  // Server-side environment check (Node.js/SSR)
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const img = new Image();

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      cleanup();
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    img.onerror = () => {
      cleanup();
      resolve(false);
    };

    timer = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    img.src = url;
  });
}

export async function preloadArtwork(url: string): Promise<boolean> {
  if (!url) return false;
  try {
    return await validateArtworkUrl(url, 5000);
  } catch {
    return false;
  }
}
