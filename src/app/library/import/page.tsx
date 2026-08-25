'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { LibraryMigrationEngine } from '@/services/portability/LibraryMigrationEngine';
import { ImportMigrationReport, TrackMatchResult } from '@/types/portability';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';

export default function ImportCenterPage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();

  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [report, setReport] = useState<ImportMigrationReport | null>(null);

  const handleStartImport = async () => {
    if (!jsonInput.trim()) return;
    setIsProcessing(true);
    setReport(null);

    try {
      const parsed = JSON.parse(jsonInput);
      const items: any[] = Array.isArray(parsed) ? parsed : parsed.tracks || [];

      const rawTracks = items.map((i) => ({
        title: typeof i === 'string' ? i : i.title || '',
        artist: typeof i === 'string' ? 'Unknown' : i.artist || 'Unknown',
        album: i.album,
        duration: i.duration,
        isrc: i.isrc,
      }));

      const res = await LibraryMigrationEngine.processImportItems(rawTracks, (cur, tot) => {
        setProgress({ current: cur, total: tot });
      });

      setReport(res);
    } catch {
      alert('Invalid JSON format. Please paste a valid playlist JSON array.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptReviewItem = (item: TrackMatchResult) => {
    if (!item.matchedTrack || !report) return;
    setReport({
      ...report,
      exactMatchesCount: report.exactMatchesCount + 1,
      needsReviewCount: report.needsReviewCount - 1,
      matchedTracks: [...report.matchedTracks, item.matchedTrack],
      reviewItems: report.reviewItems.filter((r) => r !== item),
    });
  };

  return (
    <FeatureErrorBoundary featureName="Import Center">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Upload className="h-7 w-7 text-[#00D9FF]" /> Import &amp; Library Portability
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Bring your existing playlists into NeoTunes with exact canonical track matching and version safety.
          </p>
        </div>

        {/* Input Box */}
        <div className="p-6 rounded-3xl bg-[#090C12] border border-white/10 space-y-4 shadow-xl">
          <label className="block text-xs font-mono font-bold text-white uppercase">Paste Playlist JSON Payload</label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[{"title": "Shayad", "artist": "Arijit Singh"}, {"title": "Blinding Lights", "artist": "The Weeknd"}]'
            className="w-full h-32 p-4 rounded-2xl bg-black/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#00D9FF]"
          />

          <button
            onClick={handleStartImport}
            disabled={isProcessing || !jsonInput.trim()}
            className="px-6 py-3 rounded-full bg-[#00D9FF] text-black font-mono font-extrabold text-xs uppercase tracking-wider hover:scale-105 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Processing ({progress.current}/{progress.total})
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" /> Start Exact Match Import
              </>
            )}
          </button>
        </div>

        {/* Report Overview (Section 15 & 65) */}
        {report && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-[#0A0D14] border border-white/10 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">Migration Summary Report</h3>
              <p className="text-sm font-mono text-[#DFFF00]">
                {report.totalProcessed} tracks processed • {report.exactMatchesCount} exact matches • {report.needsReviewCount} need review • {report.unavailableCount} unavailable
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <span className="block text-xl font-black">{report.exactMatchesCount}</span>
                  <span className="text-[10px] uppercase font-mono font-bold">Exact Matches</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <span className="block text-xl font-black">{report.needsReviewCount}</span>
                  <span className="text-[10px] uppercase font-mono font-bold">Needs Review</span>
                </div>
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
                  <span className="block text-xl font-black">{report.unavailableCount}</span>
                  <span className="text-[10px] uppercase font-mono font-bold">Unavailable</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <span className="block text-xl font-black">{report.duplicatesCount}</span>
                  <span className="text-[10px] uppercase font-mono font-bold">Duplicates</span>
                </div>
              </div>
            </div>

            {/* Review Section */}
            {report.reviewItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">Tracks Needing Review ({report.reviewItems.length})</h4>
                <div className="space-y-3">
                  {report.reviewItems.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">{item.matchExplanation}</span>
                        <h5 className="text-xs font-bold text-white">{item.sourceTrack.title} — {item.sourceTrack.artist}</h5>
                        {item.matchedTrack && (
                          <p className="text-[11px] text-[#A1A1A6]">
                            Match: "{item.matchedTrack.title}" by {getArtistName(item.matchedTrack.artist)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptReviewItem(item)}
                          className="px-4 py-1.5 rounded-full bg-emerald-500 text-black text-xs font-mono font-bold hover:scale-105 transition-all flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" /> Accept Match
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
