'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

export default function Soundstage3DWidget() {
  const { soundstageMode, setSoundstageMode, eqGains } = usePlaybackStore();
  const [activePreset, setActivePreset] = useState<string>('Concert Hall');
  const [activeDsp, setActiveDsp] = useState<string>('Concert Hall');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const presets = ['Concert Hall', 'Studio', 'Spatial Surround', 'Club'];

  const dspToggles = [
    { id: 'Bass Booster', label: 'Bass Booster', icon: '🔊' },
    { id: 'Lo-Fi Warmth', label: 'Lo-Fi Warmth', icon: '🎧' },
    { id: 'Concert Hall', label: 'Concert Hall', icon: '🏛️' },
    { id: 'Stereo Expand', label: 'Stereo Expand', icon: '📻' },
  ];

  // Draw 3D Spatial Audio Head Canvas with orbital sound speakers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 10;
      const headRadius = 38;

      // 1. Draw orbital spatial sound rings
      for (let r = 60; r <= 110; r += 25) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = r === 85 ? 'rgba(175, 199, 255, 0.4)' : 'rgba(122, 60, 255, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 2. Draw surrounding 3D speaker nodes rotating around head
      const speakerPositions = [
        { a: angle, r: 85 },
        { a: angle + Math.PI / 2, r: 85 },
        { a: angle + Math.PI, r: 85 },
        { a: angle + (3 * Math.PI) / 2, r: 85 },
      ];

      speakerPositions.forEach((sp, idx) => {
        const sx = cx + Math.cos(sp.a) * sp.r;
        const sy = cy + Math.sin(sp.a) * (sp.r * 0.5);

        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? 'rgba(175, 199, 255, 0.6)' : 'rgba(122, 60, 255, 0.6)';
        ctx.shadowColor = idx % 2 === 0 ? '#AFC7FF' : '#7A3CFF';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Draw central 3D head wireframe
      ctx.beginPath();
      ctx.arc(cx, cy - 8, headRadius, 0, Math.PI * 2);
      const headGradient = ctx.createRadialGradient(cx, cy - 8, 5, cx, cy - 8, headRadius);
      headGradient.addColorStop(0, 'rgba(175, 199, 255, 0.8)');
      headGradient.addColorStop(0.7, 'rgba(18, 19, 24, 0.9)');
      headGradient.addColorStop(1, 'rgba(122, 60, 255, 0.4)');
      ctx.fillStyle = headGradient;
      ctx.strokeStyle = '#AFC7FF';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#AFC7FF';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Headphones on silhouette
      ctx.beginPath();
      ctx.arc(cx - headRadius, cy - 8, 8, 0, Math.PI * 2);
      ctx.arc(cx + headRadius, cy - 8, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#AFC7FF';
      ctx.fill();

      // Headphone headband
      ctx.beginPath();
      ctx.arc(cx, cy - 8, headRadius + 4, Math.PI, 0);
      ctx.strokeStyle = '#AFC7FF';
      ctx.lineWidth = 3;
      ctx.stroke();

      angle += 0.015;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="p-5 rounded-[28px] bg-[#121318] border border-white/10 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            Soundstage 3D <Sparkles className="h-4 w-4 text-[#AFC7FF]" />
          </h3>
          <p className="text-[11px] text-[#A8A7AF]">Immersive Audio Experience</p>
        </div>
      </div>

      {/* 3D Head Canvas */}
      <div className="relative h-44 w-full flex items-center justify-center bg-[#17181D] rounded-2xl border border-white/10 overflow-hidden">
        <canvas ref={canvasRef} width={280} height={170} className="w-full h-full" />
      </div>

      {/* Preset Selector Dropdown */}
      <div className="relative">
        <select
          value={soundstageMode || activePreset}
          onChange={(e) => {
            setActivePreset(e.target.value);
            setSoundstageMode(e.target.value as any);
          }}
          className="w-full bg-[#17181D] border border-white/15 text-white text-xs font-bold rounded-xl py-2.5 px-3 appearance-none focus:outline-none focus:border-[#AFC7FF] cursor-pointer"
        >
          {presets.map((p) => (
            <option key={p} value={p} className="bg-[#121318] text-white">
              {p}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A7AF] pointer-events-none" />
      </div>

      {/* 5-Band Spectrum Visualizer */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between h-14 bg-[#17181D] rounded-xl p-3 border border-white/5">
          {['60Hz', '250Hz', '1kHz', '4kHz', '16kHz'].map((freq, idx) => {
            const heights = [60, 85, 45, 95, 70];
            return (
              <div key={freq} className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-2 bg-white/10 rounded-full flex items-end overflow-hidden">
                  <div
                    className="w-full bg-[#AFC7FF] rounded-full transition-all duration-300"
                    style={{ height: `${heights[idx]}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-[#A8A7AF] font-bold">{freq}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware DSP Toggles Grid */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {dspToggles.map((item) => {
          const isActive = activeDsp === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveDsp(item.id)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-[#AFC7FF]/20 border-[#AFC7FF] text-white shadow-[0_0_15px_rgba(175,199,255,0.3)]'
                  : 'bg-[#17181D] border-white/10 text-[#A8A7AF] hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
