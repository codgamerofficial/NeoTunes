'use client';

import React, { useEffect, useRef, useState } from 'react';
import { audioDspEngine } from '@/services/audioDspEngine';

export type VisualizerMode = 'spectrum' | 'waveform' | 'pulse' | 'aurora' | 'minimal';

interface RealAudioVisualizerProps {
  isPlaying: boolean;
  mode?: VisualizerMode;
  className?: string;
}

export default function RealAudioVisualizer({
  isPlaying,
  mode = 'spectrum',
  className = '',
}: RealAudioVisualizerProps) {
  const [activeMode, setActiveMode] = useState<VisualizerMode>(mode);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Get real frequency data array (64 bytes)
      const data = audioDspEngine.getFrequencyData();
      const hasRealAudio = isPlaying && data && Array.from(data).some((v: number) => v > 0);

      // Fallback synthetic frequency data if real analyser is idle/CORS restricted
      const barCount = 32;
      const buffer = new Uint8Array(barCount);
      for (let i = 0; i < barCount; i++) {
        if (hasRealAudio && data) {
          buffer[i] = data[i % data.length] || 0;
        } else if (isPlaying) {
          // Subtle realistic frequency simulation when audio node is playing
          const t = Date.now() * 0.003;
          buffer[i] = Math.floor(
            (Math.sin(t + i * 0.3) * 0.4 + Math.cos(t * 0.7 + i * 0.5) * 0.4 + 0.5) * 180
          );
        } else {
          buffer[i] = 4;
        }
      }

      // Mode 1: SPECTRUM (Equalizer bars)
      if (activeMode === 'spectrum') {
        const barWidth = (width / barCount) * 0.7;
        const gap = (width / barCount) * 0.3;

        for (let i = 0; i < barCount; i++) {
          const val = buffer[i];
          const barHeight = (val / 255) * (height * 0.85);

          const x = i * (barWidth + gap) + gap / 2;
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, '#00D9FF');
          grad.addColorStop(0.5, '#6D3BFF');
          grad.addColorStop(1, '#FF2D9A');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
          ctx.fill();
        }
      }
      // Mode 2: WAVEFORM (Oscilloscope smooth wave)
      else if (activeMode === 'waveform') {
        ctx.beginPath();
        ctx.lineWidth = 3;
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, '#00D9FF');
        grad.addColorStop(0.5, '#2563FF');
        grad.addColorStop(1, '#FF2D9A');
        ctx.strokeStyle = grad;

        const sliceWidth = width / barCount;
        let x = 0;

        for (let i = 0; i < barCount; i++) {
          const v = buffer[i] / 255.0;
          const y = height / 2 + (v - 0.5) * (height * 0.7);

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }
        ctx.stroke();
      }
      // Mode 3: PULSE (Concentric rings)
      else if (activeMode === 'pulse') {
        const centerX = width / 2;
        const centerY = height / 2;
        const avgVal = buffer.reduce((a, b) => a + b, 0) / barCount;
        const maxRadius = Math.min(centerX, centerY) * 0.8;
        const radius = (avgVal / 255) * maxRadius + 20;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00D9FF';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00D9FF';
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      // Mode 4: AURORA (Fluid gradient wave blobs)
      else if (activeMode === 'aurora') {
        const avgVal = buffer.reduce((a, b) => a + b, 0) / barCount;
        const grad = ctx.createRadialGradient(
          width / 2,
          height / 2,
          10,
          width / 2,
          height / 2,
          (avgVal / 255) * (width * 0.4) + 40
        );
        grad.addColorStop(0, 'rgba(0, 217, 255, 0.4)');
        grad.addColorStop(0.5, 'rgba(109, 59, 255, 0.25)');
        grad.addColorStop(1, 'rgba(7, 9, 14, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
      // Mode 5: MINIMAL (Minimalist pulsing line)
      else {
        const avgVal = buffer.reduce((a, b) => a + b, 0) / barCount;
        const lineLen = (avgVal / 255) * (width * 0.8) + 20;
        ctx.fillStyle = '#00D9FF';
        ctx.fillRect((width - lineLen) / 2, height / 2 - 1.5, lineLen, 3);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, activeMode]);

  return (
    <div className={`flex flex-col h-full w-full p-4 bg-[#07090E]/90 rounded-3xl border border-white/10 ${className}`}>
      {/* Visualizer Mode Selector */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <span className="text-xs font-mono font-black text-[#00D9FF] uppercase tracking-widest">
          AUDIO VISUALIZER
        </span>
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-full border border-white/10 text-[10px] font-bold">
          {(['spectrum', 'waveform', 'pulse', 'aurora', 'minimal'] as VisualizerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-2.5 py-1 rounded-full uppercase transition-all cursor-pointer ${
                activeMode === m
                  ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_#00D9FF]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Element */}
      <div className="flex-1 flex items-center justify-center min-h-[220px]">
        <canvas
          ref={canvasRef}
          width={500}
          height={260}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
