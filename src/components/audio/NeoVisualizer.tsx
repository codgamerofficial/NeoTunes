'use client';

import React, { useEffect, useRef } from 'react';

interface NeoVisualizerProps {
  mode?: 'minimal' | 'spectrum' | 'wave' | 'ambient';
  isPlaying?: boolean;
  className?: string;
}

export const NeoVisualizer: React.FC<NeoVisualizerProps> = ({
  mode = 'spectrum',
  isPlaying = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;

      if (!isPlaying) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, height / 2 - 1, width, 2);
        return;
      }

      phase += 0.05;

      if (mode === 'spectrum') {
        const barCount = 16;
        const barWidth = width / barCount - 2;
        for (let i = 0; i < barCount; i++) {
          const barHeight = (Math.sin(phase + i * 0.4) * 0.4 + 0.5) * height * 0.8;
          ctx.fillStyle = '#00D9FF';
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
        }
      } else if (mode === 'wave') {
        ctx.beginPath();
        ctx.strokeStyle = '#00D9FF';
        ctx.lineWidth = 2;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.05 + phase) * (height * 0.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [mode, isPlaying]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black/40 border border-white/10 ${className}`}>
      <canvas ref={canvasRef} width={300} height={80} className="w-full h-full object-cover" />
    </div>
  );
};
