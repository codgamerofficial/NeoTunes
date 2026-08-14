'use client';

import React, { useState, useEffect } from 'react';
import { MusicSearchService, NormalizedSearchResult } from '@/services/MusicSearchService';
import { Activity, CheckCircle, AlertTriangle, RefreshCw, Search, Database } from 'lucide-react';

export default function MusicApiDebugPage() {
  const [spotifyStatus, setSpotifyStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [youtubeStatus, setYoutubeStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [testQuery, setTestQuery] = useState('Naal Nachna');
  const [isSearching, setIsSearching] = useState(false);
  const [lastResults, setLastResults] = useState<NormalizedSearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setSpotifyStatus('checking');
    setYoutubeStatus('checking');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/spotify/search?q=test');
      if (res.ok) {
        setSpotifyStatus('connected');
      } else {
        setSpotifyStatus('error');
      }
    } catch {
      setSpotifyStatus('error');
    }

    try {
      const res = await fetch('/api/search?q=test');
      if (res.ok) {
        setYoutubeStatus('connected');
      } else {
        setYoutubeStatus('error');
      }
    } catch {
      setYoutubeStatus('error');
    }
  };

  const runTestSearch = async () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);
    setErrorMsg(null);

    try {
      const results = await MusicSearchService.searchAll(testQuery);
      setLastResults(results);
    } catch (err: any) {
      setErrorMsg(err.message || 'Search execution failed');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    runHealthCheck();
    runTestSearch();
  }, []);

  return (
    <div className="p-6 sm:p-10 bg-[#05060A] text-white min-h-screen font-mono space-y-8 select-none">
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#00D9FF]" /> Music API Diagnostics
          </h1>
          <p className="text-xs text-white/50 mt-1">Real-time status check for Spotify, YouTube, and multi-provider search engine.</p>
        </div>

        <button
          onClick={runHealthCheck}
          className="px-4 py-2 rounded-xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-[#00D9FF]" /> Refresh Health
        </button>
      </div>

      {/* ── PROVIDER STATUS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Spotify Status */}
        <div className="p-5 rounded-2xl bg-[#121620] border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white/60">Spotify Provider</span>
            <p className="text-sm font-bold text-white">Catalog & Metadata Source</p>
          </div>
          <div className="flex items-center gap-2">
            {spotifyStatus === 'connected' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> CONNECTED
              </span>
            )}
            {spotifyStatus === 'error' && (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> DEGRADED / ERROR
              </span>
            )}
            {spotifyStatus === 'checking' && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                CHECKING...
              </span>
            )}
          </div>
        </div>

        {/* YouTube / Multi-Provider Status */}
        <div className="p-5 rounded-2xl bg-[#121620] border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-white/60">YouTube / Pipeline Status</span>
            <p className="text-sm font-bold text-white">Audio Stream & Video Source</p>
          </div>
          <div className="flex items-center gap-2">
            {youtubeStatus === 'connected' && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> CONNECTED
              </span>
            )}
            {youtubeStatus === 'error' && (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> DEGRADED / ERROR
              </span>
            )}
            {youtubeStatus === 'checking' && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
                CHECKING...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── TEST SEARCH RUNNER ── */}
      <div className="p-6 rounded-3xl bg-[#121620] border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Search className="w-4 h-4 text-[#00D9FF]" /> Test Search Engine Query
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Type query (e.g. Naal Nachna)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#080a0f] border border-white/10 text-white text-xs outline-none focus:border-[#00D9FF]"
          />
          <button
            onClick={runTestSearch}
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl bg-[#00D9FF] text-black text-xs font-bold hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer"
          >
            {isSearching ? 'Searching...' : 'Run Test'}
          </button>
        </div>

        {/* Preset Quick Tests */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['Naal Nachna', 'Arijit Singh', 'Shakira', 'Blinding Lights', 'Kesariya', 'Freaked Out'].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                setTestQuery(preset);
                setIsSearching(true);
                MusicSearchService.searchAll(preset).then(setLastResults).finally(() => setIsSearching(false));
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all cursor-pointer"
            >
              "{preset}"
            </button>
          ))}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        {lastResults && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Songs</span>
                <span className="text-lg font-bold text-[#00D9FF]">{lastResults.songs.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Artists</span>
                <span className="text-lg font-bold text-[#00D9FF]">{lastResults.artists.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Albums</span>
                <span className="text-lg font-bold text-[#00D9FF]">{lastResults.albums.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 block">Playlists</span>
                <span className="text-lg font-bold text-[#00D9FF]">{lastResults.playlists.length}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080a0f] border border-white/10 space-y-2 max-h-80 overflow-y-auto">
              <span className="text-xs font-bold text-white/60">Top Songs Returned:</span>
              {lastResults.songs.slice(0, 5).map((song, i) => (
                <div key={song.canonicalId || i} className="text-xs text-white/80 flex items-center justify-between border-b border-white/5 py-1.5">
                  <span className="truncate max-w-xs">{i + 1}. {song.title} — {Array.isArray(song.artists) ? song.artists.map(a => typeof a === 'string' ? a : a?.name || '').join(', ') : (typeof song.artist === 'string' ? song.artist : (song.artist as any)?.name || 'Artist')}</span>
                  <span className="text-[10px] text-white/40">{typeof song.album === 'string' ? song.album : song.album?.name || 'Single'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
