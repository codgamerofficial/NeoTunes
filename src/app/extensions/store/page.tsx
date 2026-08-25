'use client';

import React, { useState, useEffect } from 'react';
import { Package, ShieldAlert, ShieldCheck, Download, Trash2, Cpu, Sparkles, Eye, Lock } from 'lucide-react';
import { ExtensionManager } from '@/services/sdk/ExtensionManager';
import { NeoTunesSDK } from '@/services/sdk/NeoTunesSDK';
import { ExtensionManifest, InstalledExtension } from '@/types/extension-sdk';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoCard } from '@/components/ui/NeoCard';

export default function ExtensionsStorePage() {
  const [storeExts, setStoreExts] = useState<ExtensionManifest[]>([]);
  const [installed, setInstalled] = useState<InstalledExtension[]>([]);

  const loadData = () => {
    setStoreExts(ExtensionManager.getStoreExtensions());
    setInstalled(ExtensionManager.getInstalledExtensions());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInstall = (manifest: ExtensionManifest) => {
    ExtensionManager.installExtension(manifest);
    loadData();
  };

  const handleRevoke = (extensionId: string) => {
    ExtensionManager.revokePermissions(extensionId);
    loadData();
  };

  return (
    <FeatureErrorBoundary featureName="Extensions & SDK Sandbox">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-4xl mx-auto min-h-screen">
        
        {/* Header */}
        <div className="space-y-2 border-b border-white/10 pb-4">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Package className="h-7 w-7 text-[#00D9FF]" /> NeoTunes Platform SDK & Extension Store
          </h1>
          <p className="text-xs text-[#A1A1A6]">
            Sandboxed, permission-based plugin architecture for community visualizers, themes, and AI tools.
          </p>
        </div>

        {/* Installed Extensions & Permission Sandbox (Section 10, 14, 89) */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Installed Extensions</h3>
          <div className="space-y-3">
            {installed.map((item) => (
              <NeoCard key={item.manifest.id} glass className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{item.manifest.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        item.state === 'ENABLED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-red-500/20 text-red-400 border border-red-500/40'
                      }`}
                    >
                      {item.state}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A1A1A6] font-mono">
                    ID: {item.manifest.id} • v{item.manifest.version} • Author: {item.manifest.author}
                  </p>
                  <p className="text-[10px] text-[#00D9FF] font-mono">
                    Permissions: {item.grantedPermissions.length > 0 ? item.grantedPermissions.join(', ') : 'None (Revoked)'}
                  </p>
                </div>

                {item.state === 'ENABLED' ? (
                  <NeoButton variant="danger" size="sm" onClick={() => handleRevoke(item.manifest.id)}>
                    Revoke All Access
                  </NeoButton>
                ) : (
                  <NeoButton variant="glass" size="sm" onClick={() => handleInstall(item.manifest)}>
                    Re-Enable Access
                  </NeoButton>
                )}
              </NeoCard>
            ))}
          </div>
        </div>

        {/* Extension Store Catalog (Section 49 & 50) */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">Extension Store Catalog</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {storeExts.map((manifest) => {
              const isInstalled = installed.some((i) => i.manifest.id === manifest.id && i.state === 'ENABLED');
              return (
                <NeoCard key={manifest.id} glass className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{manifest.name}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[9px] font-mono uppercase">
                      {manifest.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1A6]">{manifest.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono text-[#A1A1A6]">Req: {manifest.permissions.length} perms</span>
                    {!isInstalled && (
                      <NeoButton variant="primary" size="sm" onClick={() => handleInstall(manifest)}>
                        <Download className="h-3.5 w-3.5" /> Install
                      </NeoButton>
                    )}
                  </div>
                </NeoCard>
              );
            })}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
