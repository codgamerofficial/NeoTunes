'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePlaybackStore } from '@/store/playback-store';
import { useQueryClient } from '@tanstack/react-query';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: (() => void) | undefined;
    YT: any;
  }
}

export default function YouTubePlayer() {
  const queryClient = useQueryClient();
  const {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    playbackRate,
    setPlaying,
    setIsLoadingStream,
    setProgress,
    setDuration,
    nextTrack,
    setCurrentTrack,
    cacheStreamSource,
    streamCache,
    setPlaybackStatus,
    setBuffered,
  } = usePlaybackStore();

  const playerRef = useRef<any>(null);
  const iframeContainerId = 'yt-player-iframe-root';
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef<number>(0);
  const lastLoggedTrackIdRef = useRef<string | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  const cleanTitle = (title: string) => {
    if (!title) return 'NeoTunes Track';
    return title.split('_')[0].split('ft.')[0].split('(Official')[0].split('|')[0].trim();
  };

  // 1. Load YouTube IFrame API Script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true);
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, []);

  // 2. Initialize YT Player once API is ready
  useEffect(() => {
    if (!apiReady || playerRef.current) return;

    const container = document.getElementById(iframeContainerId);
    if (!container) return;

    playerRef.current = new window.YT.Player(iframeContainerId, {
      height: '0',
      width: '0',
      videoId: '',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(isMuted ? 0 : volume * 100);
          event.target.setPlaybackRate(playbackRate);
        },
        onStateChange: (event: any) => {
          const state = event.data;

          if (state === window.YT.PlayerState.BUFFERING) {
            setPlaybackStatus('buffering');
          } else if (state === window.YT.PlayerState.PLAYING) {
            setPlaybackStatus('playing');
            setPlaying(true);
            setIsLoadingStream(false);
            errorCountRef.current = 0;
            startProgressLoop();
          } else if (state === window.YT.PlayerState.PAUSED) {
            setPlaybackStatus('paused');
            setPlaying(false);
            stopProgressLoop();
          } else if (state === window.YT.PlayerState.ENDED) {
            stopProgressLoop();
            lastLoggedTrackIdRef.current = null;
            setPlaybackStatus('ended');
            nextTrack();
          }
        },
        onError: async (event: any) => {
          const errCode = event.data;
          console.warn('YouTube Player error code:', errCode);
          stopProgressLoop();

          const curTrack = usePlaybackStore.getState().currentTrack;

          // Attempt fallback resolution for restricted video IDs (Error 150/101/2/5)
          if (curTrack && errorCountRef.current === 0) {
            errorCountRef.current += 1;
            setPlaybackStatus('connecting');
            try {
              const queryStr = `${curTrack.title} ${curTrack.artist?.name || ''} audio`.trim();
              const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(queryStr)}`);
              const data = await res.json();
              const altVid = data.videoId || data.sourceId;

              if (altVid && altVid !== curTrack.sourceId) {
                usePlaybackStore.getState().cacheStreamSource(curTrack.id, altVid);
                usePlaybackStore.getState().setCurrentTrack({ ...curTrack, sourceId: altVid });
                if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
                  playerRef.current.loadVideoById(altVid);
                  return;
                }
              }
            } catch (fallbackErr) {
              console.warn('Fallback stream resolution failed:', fallbackErr);
            }
          }

          // If fallback fails or is unavailable, show explicit error and stop (do not skip track)
          setIsLoadingStream(false);
          setPlaybackStatus('error', 'Audio playback restricted by YouTube owner for this track');
          setPlaying(false);
        },
      },
    });
  }, [apiReady]);

  // 3. Handle Track & Playback state changes
  useEffect(() => {
    if (!currentTrack) return;
    if (currentTrack.sourceType === 'cloud') return;

    const player = playerRef.current;
    if (!player || typeof player.loadVideoById !== 'function') return;

    const resolveAndPlay = async () => {
      // Extract valid YouTube Video ID
      let targetId: string | undefined = undefined;

      if (currentTrack.sourceId) {
        targetId = currentTrack.sourceId;
      } else if (currentTrack.id?.startsWith('yt_')) {
        targetId = currentTrack.id.replace('yt_', '');
      } else if (streamCache && streamCache[currentTrack.id]) {
        targetId = streamCache[currentTrack.id];
      }

      // If valid YouTube Video ID is missing (e.g. Spotify ID 4cODK2w...), search YouTube asynchronously
      if (!targetId) {
        if (resolvingId === currentTrack.id) return;
        setResolvingId(currentTrack.id);
        setIsLoadingStream(true);
        setPlaybackStatus('connecting');

        try {
          const queryStr = `${currentTrack.title} ${currentTrack.artist?.name || ''}`.trim();
          const res = await fetch(
            `/api/youtube/search?q=${encodeURIComponent(queryStr)}&title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist?.name || '')}&trackId=${encodeURIComponent(currentTrack.id)}`
          );
          const data = await res.json();
          const resolvedVid: string =
            data.videoId ||
            data.sourceId ||
            data.track?.sourceId ||
            (Array.isArray(data) && data[0]?.id) ||
            data.items?.[0]?.id?.videoId ||
            '';

          if (resolvedVid) {
            targetId = resolvedVid;
            cacheStreamSource(currentTrack.id, resolvedVid);
            setCurrentTrack({ ...currentTrack, sourceId: resolvedVid });
          } else {
            throw new Error('No YouTube match found for track');
          }
        } catch (err) {
          console.warn('Fallback resolve error:', err);
          setResolvingId(null);
          setIsLoadingStream(false);
          setPlaybackStatus('error', 'Could not resolve audio stream');
          setPlaying(false);
          return;
        }
        setResolvingId(null);
      }

      // Load & Play Target YouTube Video ID
      if (targetId) {
        try {
          const currentData = player.getVideoData ? player.getVideoData() : null;
          const currentVideoId = currentData ? currentData.video_id : null;

          if (currentVideoId !== targetId) {
            player.loadVideoById(targetId);
          } else {
            if (isPlaying) {
              player.playVideo();
            } else {
              player.pauseVideo();
            }
          }
        } catch (err) {
          console.warn('Error applying track state to YT player:', err);
        }
      }
    };

    resolveAndPlay();
  }, [currentTrack?.id, currentTrack?.sourceId, isPlaying]);

  // Handle Play/Pause toggle when currentTrack is YouTube
  useEffect(() => {
    if (!currentTrack || currentTrack.sourceType === 'cloud') return;
    const player = playerRef.current;
    if (!player || typeof player.getPlayerState !== 'function') return;

    try {
      if (isPlaying) {
        player.playVideo();
        startProgressLoop();
      } else {
        player.pauseVideo();
        stopProgressLoop();
      }
    } catch {
      // ignore
    }
  }, [isPlaying]);

  // Volume & Mute sync
  useEffect(() => {
    const player = playerRef.current;
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(isMuted ? 0 : volume * 100);
    }
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Playback rate sync
  useEffect(() => {
    const player = playerRef.current;
    if (player && typeof player.setPlaybackRate === 'function') {
      player.setPlaybackRate(playbackRate);
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Handle seek event from other components (like MiniPlayer)
  useEffect(() => {
    const handleSeek = (e: Event) => {
      const customEvent = e as CustomEvent<{ time: number }>;
      const seekTime = customEvent.detail.time;
      const player = playerRef.current;
      const audio = audioRef.current;

      if (currentTrack?.sourceType === 'cloud' && audio) {
        audio.currentTime = seekTime;
        setProgress(seekTime);
      } else if (player && typeof player.seekTo === 'function') {
        player.seekTo(seekTime, true);
        setProgress(seekTime);
      }
    };

    window.addEventListener('seek-track', handleSeek);
    return () => {
      window.removeEventListener('seek-track', handleSeek);
    };
  }, [currentTrack, setProgress]);

  // Sync / Log history when a track starts playing
  useEffect(() => {
    if (!currentTrack || !isPlaying) return;
    if (lastLoggedTrackIdRef.current === currentTrack.id) return;

    lastLoggedTrackIdRef.current = currentTrack.id;

    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: currentTrack.id, track: currentTrack }),
    })
      .then((res) => {
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ['history'] });
        }
      })
      .catch((err) => console.warn('Failed to log history:', err));
  }, [currentTrack?.id, isPlaying, queryClient]);

  // 4. BACKGROUND MEDIA KEEP-ALIVE & WAKE LOCK FOR SMARTPHONES
  useEffect(() => {
    const silentAudio = silentAudioRef.current;
    let wakeLockSentinel: any = null;

    if (isPlaying) {
      if (silentAudio) {
        silentAudio.play().catch(() => {});
      }
      if ('wakeLock' in navigator && (navigator as any).wakeLock) {
        (navigator as any).wakeLock.request('screen')
          .then((wl: any) => { wakeLockSentinel = wl; })
          .catch(() => {});
      }
    } else {
      if (silentAudio) {
        silentAudio.pause();
      }
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    }

    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [isPlaying]);

  // 5. BACKGROUND PLAYBACK & MEDIA SESSION LOCKSCREEN CONTROLS
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || !currentTrack) return;

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: cleanTitle(currentTrack.title),
        artist: currentTrack.artist?.name || 'Artist',
        album: currentTrack.album?.name || 'NeoTunes',
        artwork: [
          { src: currentTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=512&q=80', sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => setPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setPlaying(false));
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => usePlaybackStore.getState().prevTrack());
      navigator.mediaSession.setActionHandler('stop', () => setPlaying(false));
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          const player = playerRef.current;
          const audio = audioRef.current;
          if (currentTrack?.sourceType === 'cloud' && audio) {
            audio.currentTime = details.seekTime;
            setProgress(details.seekTime);
          } else if (player && typeof player.seekTo === 'function') {
            player.seekTo(details.seekTime, true);
            setProgress(details.seekTime);
          }
        }
      });
    } catch (err) {
      console.warn('MediaSession Error:', err);
    }
  }, [currentTrack?.id, isPlaying, nextTrack, setPlaying, setProgress]);

  const startProgressLoop = () => {
    stopProgressLoop();
    progressIntervalRef.current = setInterval(() => {
      const player = playerRef.current;
      const audio = audioRef.current;

      if (currentTrack?.sourceType === 'cloud' && audio) {
        const currentTime = audio.currentTime || 0;
        const dur = audio.duration || 0;
        setProgress(currentTime);
        if (dur > 0) setDuration(dur);
        updateMediaSessionPosition(currentTime, dur || 1);
      } else if (player && typeof player.getCurrentTime === 'function') {
        const currentTime = player.getCurrentTime() || 0;
        const dur = typeof player.getDuration === 'function' ? player.getDuration() || 0 : 0;
        const loadedFraction = typeof player.getVideoLoadedFraction === 'function' ? player.getVideoLoadedFraction() : 0;
        setProgress(currentTime);
        if (dur > 0) setDuration(dur);
        if (loadedFraction > 0 && dur > 0) setBuffered(loadedFraction * dur);
        updateMediaSessionPosition(currentTime, dur || 1);
      }
    }, 250);
  };

  const updateMediaSessionPosition = (currentTime: number, dur: number) => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: dur > 0 ? dur : 180,
          playbackRate: playbackRate,
          position: currentTime,
        });
      } catch {
        // ignore
      }
    }
  };

  const stopProgressLoop = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const player = playerRef.current;
      const audio = audioRef.current;

      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(!isPlaying);
      } else if (e.code === 'ArrowRight') {
        if (e.ctrlKey) {
          nextTrack();
        } else if (currentTrack?.sourceType === 'cloud' && audio) {
          const newTime = Math.min(audio.currentTime + 10, audio.duration);
          audio.currentTime = newTime;
          setProgress(newTime);
        } else if (player && typeof player.getCurrentTime === 'function') {
          const newTime = Math.min(player.getCurrentTime() + 10, player.getDuration());
          player.seekTo(newTime, true);
          setProgress(newTime);
        }
      } else if (e.code === 'ArrowLeft') {
        if (e.ctrlKey) {
          usePlaybackStore.getState().prevTrack();
        } else if (currentTrack?.sourceType === 'cloud' && audio) {
          const newTime = Math.max(audio.currentTime - 10, 0);
          audio.currentTime = newTime;
          setProgress(newTime);
        } else if (player && typeof player.getCurrentTime === 'function') {
          const newTime = Math.max(player.getCurrentTime() - 10, 0);
          player.seekTo(newTime, true);
          setProgress(newTime);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, nextTrack, setPlaying, setProgress, currentTrack?.id]);

  // Handle Cloud signed URL resolution & play trigger
  useEffect(() => {
    if (!currentTrack || currentTrack.sourceType !== 'cloud') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      return;
    }

    const resolveAndPlayCloud = async () => {
      const audio = audioRef.current;
      if (!audio) return;

      const player = playerRef.current;
      if (player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
      }

      try {
        const sourceUrl = currentTrack.sourceId || '';
        if (sourceUrl.startsWith('blob:') || sourceUrl.startsWith('data:') || sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) {
          audio.src = sourceUrl;
        } else {
          const res = await fetch(`/api/cloud/resolve?filePath=${encodeURIComponent(sourceUrl)}`);
          if (!res.ok) throw new Error('Cloud resolve failed');
          const data = await res.json();
          audio.src = data.url;
        }
        audio.load();
        if (isPlaying) {
          audio.play().catch((err) => console.warn('Audio play error:', err));
        }
      } catch (err) {
        console.error('Error loading cloud track:', err);
        nextTrack();
      }
    };

    resolveAndPlayCloud();
  }, [currentTrack?.id]);

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 h-0 w-0 overflow-hidden opacity-0">
      <div id={iframeContainerId} />
      <audio
        ref={audioRef}
        playsInline
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => {
          setPlaying(true);
          startProgressLoop();
        }}
        onPause={() => {
          setPlaying(false);
          stopProgressLoop();
        }}
        onEnded={() => {
          stopProgressLoop();
          lastLoggedTrackIdRef.current = null;
          nextTrack();
        }}
      />
      {/* Silent HTML5 audio loop for background wake-lock keep-alive */}
      <audio
        ref={silentAudioRef}
        loop
        playsInline
        src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA="
      />
    </div>
  );
}
