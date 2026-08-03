'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Headphones, Sparkles, Volume2, Sliders, Waves, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Soundstage3DWidget() {
  const [activePreset, setActivePreset] = useState<'Concert Hall' | 'Studio' | 'Spatial Surround' | 'Club'>('Concert Hall');
  const [activeDsp, setActiveDsp] = useState<string>('Concert Hall');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const presets = ['Concert Hall', 'Studio', 'Spatial Surround', 'Club'];

  const dspToggles = [
    { id: 'Bass Booster', label: 'Bass Booster', icon: '🔊' },
    { id: 'Lo-Fi Warmth', label: 'Lo-Fi Warmth', icon: '🎧' },
    { id: 'Concert Hall', label: 'Concert Hall', icon: '🏛️' },
    { id: 'Stereo Expand', label: 'Stereo Expand', icon: '📻' },
  ];

  // Draw 3D Spatial Audio Head Canvas with glowing orbital sound speakers & frequency waves
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

      // 1. Draw glowing purple orbital spatial sound rings
      for (let r = 60; r <= 110; r += 25) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = r === 85 ? 'rgba(122, 60, 255, 0.4)' : 'rgba(0, 212, 255, 0.2)';
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

        // Speaker outer glow
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? 'rgba(122, 60, 255, 0.6)' : 'rgba(0, 212, 255, 0.6)';
        ctx.shadowColor = idx % 2 === 0 ? '#7A3CFF' : '#00D4FF';
        ctx.shadowBlur = 15;
        ctx.fill();

        // Speaker inner core
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 3. Draw central 3D head wireframe silhouette
      ctx.beginPath();
      ctx.arc(cx, cy - 8, headRadius, 0, Math.PI * 2);
      const headGradient = ctx.createRadialGradient(cx, cy - 8, 5, cx, cy - 8, headRadius);
      headGradient.addColorStop(0, 'rgba(122, 60, 255, 0.8)');
      headGradient.addColorStop(0.7, 'rgba(15, 10, 30, 0.9)');
      headGradient.addColorStop(1, 'rgba(0, 212, 255, 0.4)');
      ctx.fillStyle = headGradient;
      ctx.strokeStyle = '#7A3CFF';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#7A3CFF';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Headphones on silhouette
      ctx.beginPath();
      ctx.arc(cx - headRadius, cy - 8, 8, 0, Math.PI * 2);
      ctx.arc(cx + headRadius, cy - 8, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00D4FF';
      ctx.fill();

      // Headphone headband
      ctx.beginPath();
      ctx.arc(cx, cy - 8, headRadius + 4, Math.PI, 0);
      ctx.strokeStyle = '#00D4FF';
      ctx.lineWidth = 3;
      ctx.stroke();

      angle += 0.015;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="glass-card-v2 p-5 rounded-[28px] border border-white/10 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
            Soundstage 3D <Sparkles className="h-4 w-4 text-[#7A3CFF]" />
          </h3>
          <p className="text-[11px] text-white/50">Immersive Audio Experience</p>
        </div>
      </div>

      {/* 3D Head Canvas Canvas */}
      <div className="relative h-44 w-full flex items-center justify-center bg-gradient-to-b from-[#0F0A20]/80 to-[#070514]/90 rounded-2xl border border-white/10 overflow-hidden">
        <canvas ref={canvasRef} width={280} height={170} className="w-full h-full" />
      </div>

      {/* Preset Selector Dropdown */}
      <div className="relative">
        <select
          value={activePreset}
          onChange={(e) => setActivePreset(e.target.value as any)}
          className="w-full bg-[#121024] border border-white/15 text-white text-xs font-bold rounded-xl py-2.5 px-3 appearance-none focus:outline-none focus:border-[#7A3CFF] cursor-pointer"
        >
          {presets.map((p) => (
            <option key={p} value={p} className="bg-[#0F0A20] text-white">
              {p}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
      </div>

      {/* 5-Band Spectrum Visualizer */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between h-14 bg-black/40 rounded-xl p-3 border border-white/5">
          {['60Hz', '250Hz', '1kHz', '4kHz', '16kHz'].map((freq, idx) => {
            const heights = [60, 85, 45, 95, 70];
            return (
              <div key={freq} className="flex flex-col items-center gap-1 flex-1">
                <div className="h-8 w-2 bg-white/10 rounded-full flex items-end overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-[#7A3CFF] to-[#00D4FF] rounded-full transition-all duration-300"
                    style={{ height: `${heights[idx]}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-white/40 font-bold">{freq}</span>
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
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                isActive
                  ? 'bg-gradient-to-r from-[#7A3CFF]/30 to-[#00D4FF]/30 border-[#7A3CFF] text-white shadow-[0_0_15px_rgba(122,60,255,0.4)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Settings Drawer Button */}
      <button className="w-full text-center text-xs font-bold text-white/50 hover:text-white pt-1 transition-colors">
        + Advanced Settings
      </button>
    </div>
  );
}
