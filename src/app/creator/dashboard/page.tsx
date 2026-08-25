'use client';

import React, { useState, useEffect } from 'react';
import { Mic2, Plus, Sparkles, CheckCircle2, BarChart2, Play, Bookmark, Users, Shield, Clock } from 'lucide-react';
import { CreatorContentService } from '@/services/creator/CreatorContentService';
import { CreatorProfile, CreatorContent, CreatorAnalytics, ContentStatus, ContentType } from '@/types/creator-ecosystem';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [contentList, setContentList] = useState<CreatorContent[]>([]);
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [filter, setFilter] = useState<ContentStatus | 'ALL'>('ALL');
  const [newTitle, setNewTitle] = useState('');

  const loadData = () => {
    setProfile(CreatorContentService.getProfile());
    setContentList(CreatorContentService.getCreatorContent());
    setAnalytics(CreatorContentService.getAnalytics());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDraft = () => {
    if (!newTitle.trim()) return;
    CreatorContentService.createDraft(newTitle.trim(), 'SINGLE');
    setNewTitle('');
    loadData();
  };

  const handlePublish = (contentId: string) => {
    CreatorContentService.publishContent(contentId);
    loadData();
  };

  const filteredContent = contentList.filter((item) => filter === 'ALL' || item.status === filter);

  return (
    <FeatureErrorBoundary featureName="Creator Studio Ecosystem">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
        
        {/* Header Profile Section */}
        {profile && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#00D9FF]/20 border border-[#00D9FF]/40 flex items-center justify-center text-[#00D9FF]">
                <Mic2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white">{profile.displayName}</h1>
                  {profile.verificationState === 'VERIFIED' && (
                    <CheckCircle2 className="h-5 w-5 text-[#00D9FF] fill-[#00D9FF]/20" />
                  )}
                </div>
                <p className="text-xs text-[#A1A1A6] font-mono">{profile.username} • Roles: {profile.roles.join(', ')}</p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="New content title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#00D9FF] flex-1 sm:w-48"
              />
              <NeoButton variant="primary" size="sm" onClick={handleCreateDraft}>
                <Plus className="h-4 w-4" /> Create Draft
              </NeoButton>
            </div>
          </div>
        )}

        {/* Analytics Summary Cards (Section 51 & 61) */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <NeoCard glass className="space-y-1">
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase flex items-center gap-1">
                <Play className="h-3 w-3 text-[#00D9FF]" /> Total Plays
              </span>
              <p className="text-xl font-extrabold text-white">{analytics.totalPlays.toLocaleString()}</p>
            </NeoCard>
            <NeoCard glass className="space-y-1">
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase flex items-center gap-1">
                <Users className="h-3 w-3 text-emerald-400" /> Listeners
              </span>
              <p className="text-xl font-extrabold text-white">{analytics.uniqueListeners.toLocaleString()}</p>
            </NeoCard>
            <NeoCard glass className="space-y-1">
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase flex items-center gap-1">
                <Bookmark className="h-3 w-3 text-indigo-400" /> Saves
              </span>
              <p className="text-xl font-extrabold text-white">{analytics.totalSaves.toLocaleString()}</p>
            </NeoCard>
            <NeoCard glass className="space-y-1">
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase flex items-center gap-1">
                <BarChart2 className="h-3 w-3 text-yellow-400" /> Completion Rate
              </span>
              <p className="text-xl font-extrabold text-white">{analytics.completionRate}%</p>
            </NeoCard>
          </div>
        )}

        {/* Content Status Filters & List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Creator Content Catalog</h3>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-mono">
              {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    filter === st ? 'bg-[#00D9FF] text-black font-bold' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredContent.map((item) => (
              <NeoCard key={item.contentId} glass className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A1A1A6] truncate">{item.description}</p>
                </div>

                {item.status === 'DRAFT' && (
                  <NeoButton variant="glass" size="sm" onClick={() => handlePublish(item.contentId)}>
                    Publish
                  </NeoButton>
                )}
              </NeoCard>
            ))}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
