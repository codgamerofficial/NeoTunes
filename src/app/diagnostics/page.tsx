'use client';

import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Cpu, RefreshCw, Copy, Check, Server, Radio, Database, Lock } from 'lucide-react';
import { SystemHealthManager } from '@/services/reliability/SystemHealthManager';
import { SystemHealthReport, SubsystemState } from '@/types/reliability';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function NeoTunesDiagnosticsPage() {
  const [report, setReport] = useState<SystemHealthReport | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchReport = () => {
    setReport(SystemHealthManager.getHealthReport());
  };

  useEffect(() => {
    fetchReport();
    const interval = setInterval(fetchReport, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyDiagnostics = () => {
    if (!report) return;
    const sanitized = {
      appVersion: '1.0.0-rc.26',
      environment: 'production',
      overallStatus: report.overallStatus,
      uptimeSeconds: report.uptimeSeconds,
      subsystems: report.subsystems,
      timestamp: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(sanitized, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!report) return null;

  const getStatusBadge = (status: SubsystemState) => {
    switch (status) {
      case 'HEALTHY':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">HEALTHY</span>;
      case 'DEGRADED':
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold uppercase">DEGRADED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-mono font-bold uppercase">{status}</span>;
    }
  };

  return (
    <FeatureErrorBoundary featureName="System Diagnostics">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Activity className="h-7 w-7 text-[#00D9FF]" /> NeoTunes System Diagnostics Center
            </h1>
            <p className="text-xs text-[#A1A1A6]">
              Real-time platform health monitoring, self-healing status, and circuit breaker metrics.
            </p>
          </div>

          <button
            onClick={handleCopyDiagnostics}
            className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4 text-[#00D9FF]" />}
            {copied ? 'Copied Bundle' : 'Copy Diagnostics'}
          </button>
        </div>

        {/* Overall Status Hero Card */}
        <div className="p-6 rounded-3xl bg-[#090C14] border border-white/10 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A1A1A6] uppercase font-bold tracking-wider">Overall Platform Status</span>
              <h2 className="text-2xl font-black text-white">{report.overallStatus}</h2>
            </div>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-[#A1A1A6] block text-[10px] uppercase">Uptime</span>
            <span className="font-bold text-[#00D9FF]">{report.uptimeSeconds}s</span>
          </div>
        </div>

        {/* Subsystems Health Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Subsystem Health Monitors</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(report.subsystems).map(([subsystem, status]) => (
              <div key={subsystem} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-bold font-mono text-white">{subsystem}</span>
                {getStatusBadge(status)}
              </div>
            ))}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
