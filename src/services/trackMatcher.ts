export interface MatchTarget {
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  isrc?: string;
  releaseYear?: number | string;
}

export interface MatchCandidate {
  title: string;
  artist: string;
  album?: string;
  durationMs?: number;
  isrc?: string;
  releaseYear?: number | string;
}

export function calculateTrackMatchScore(target: MatchTarget, candidate: MatchCandidate): number {
  let score = 0;

  const targetTitle = (target.title || '').toLowerCase().trim();
  const candidateTitle = (candidate.title || '').toLowerCase().trim();

  const targetArtist = (target.artist || '').toLowerCase().trim();
  const candidateArtist = (candidate.artist || '').toLowerCase().trim();

  const targetAlbum = (target.album || '').toLowerCase().trim();
  const candidateAlbum = (candidate.album || '').toLowerCase().trim();

  // 1. ISRC Exact Match (+100)
  if (target.isrc && candidate.isrc && target.isrc.trim().toUpperCase() === candidate.isrc.trim().toUpperCase()) {
    return 100;
  }

  // 2. Artist Matching (+30 or -100)
  if (targetArtist && candidateArtist) {
    if (targetArtist === candidateArtist || candidateArtist.includes(targetArtist) || targetArtist.includes(candidateArtist)) {
      score += 30;
    } else {
      score -= 100; // Wrong artist penalty
    }
  }

  // 3. Title Matching (+30)
  if (targetTitle && candidateTitle) {
    if (targetTitle === candidateTitle) {
      score += 30;
    } else if (candidateTitle.includes(targetTitle) || targetTitle.includes(candidateTitle)) {
      score += 20;
    }
  }

  // 4. Album Matching (+15)
  if (targetAlbum && candidateAlbum && targetAlbum !== 'single' && candidateAlbum !== 'single') {
    if (targetAlbum === candidateAlbum) {
      score += 15;
    }
  }

  // 5. Duration Tolerance (+15 or +8)
  if (target.durationMs && candidate.durationMs && target.durationMs > 0 && candidate.durationMs > 0) {
    const diffSec = Math.abs(target.durationMs - candidate.durationMs) / 1000;
    if (diffSec <= 3) {
      score += 15;
    } else if (diffSec <= 10) {
      score += 8;
    }
  }

  // 6. Year Match (+5)
  if (target.releaseYear && candidate.releaseYear) {
    const targetYr = String(target.releaseYear).slice(0, 4);
    const candidateYr = String(candidate.releaseYear).slice(0, 4);
    if (targetYr === candidateYr) {
      score += 5;
    }
  }

  // 7. Version & Noise Penalties
  const isTargetRemix = targetTitle.includes('remix');
  const isCandidateRemix = candidateTitle.includes('remix');
  if (!isTargetRemix && isCandidateRemix) {
    score -= 40;
  }

  const isTargetLive = targetTitle.includes('live');
  const isCandidateLive = candidateTitle.includes('live');
  if (!isTargetLive && isCandidateLive) {
    score -= 40;
  }

  if (candidateTitle.includes('karaoke')) score -= 100;
  if (candidateTitle.includes('instrumental') && !targetTitle.includes('instrumental')) score -= 100;
  if (candidateTitle.includes('sped up') || candidateTitle.includes('speed up')) score -= 50;
  if (candidateTitle.includes('slowed') || candidateTitle.includes('reverb')) score -= 50;
  if (candidateTitle.includes('8d audio')) score -= 50;

  return score;
}
