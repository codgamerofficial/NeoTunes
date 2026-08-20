'use client';

import React, { useEffect, useRef } from 'react';
import { useSpiderVerse } from '@/providers/SpiderVerseProvider';

export default function SpiderVerseBackground() {
  const { suitMode } = useSpiderVerse();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Multiverse Ember Particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      speedY: -Math.random() * 0.8 - 0.2,
      speedX: (Math.random() - 0.5) * 0.6,
      alpha: Math.random() * 0.7 + 0.3,
      decay: Math.random() * 0.005 + 0.002,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Color tokens based on active suit
      let emberColor = '230, 0, 38'; // Red
      if (suitMode === 'sanctum') emberColor = '255, 157, 0'; // Eldritch Amber
      if (suitMode === 'blackgold') emberColor = '255, 215, 0'; // Circuit Gold

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha -= p.decay;

        if (p.y < 0 || p.alpha <= 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.alpha = Math.random() * 0.7 + 0.3;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${emberColor}, ${p.alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${emberColor}, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [suitMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* ── 1. Multiverse Dark Mesh Gradient ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,0,38,0.12)_0%,rgba(0,85,255,0.08)_45%,rgba(7,10,18,1)_90%)] transition-colors duration-700" />

      {/* ── 2. Doctor Strange Rotating Mystic Spell Mandala (Top Right) ── */}
      <div className="absolute -top-32 -right-32 w-[550px] h-[550px] opacity-25 animate-rune-rotate">
        <svg viewBox="0 0 500 500" className="w-full h-full text-[var(--spider-gold)] fill-none stroke-current stroke-1">
          {/* Outer Spell Circles */}
          <circle cx="250" cy="250" r="230" strokeDasharray="8 6" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="210" strokeWidth="1" />
          <circle cx="250" cy="250" r="180" strokeDasharray="14 10" strokeWidth="2" />
          {/* Concentric Octagram / Hexagram Geometry */}
          <polygon points="250,40 430,250 250,460 70,250" strokeWidth="1.2" opacity="0.8" />
          <polygon points="123,123 377,123 377,377 123,377" strokeWidth="1.2" opacity="0.8" />
          <polygon points="250,70 377,197 377,303 250,430 123,303 123,197" strokeWidth="1" />
          {/* Mystic Rune Inscriptions */}
          <circle cx="250" cy="250" r="140" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="90" strokeDasharray="4 4" strokeWidth="1" />
          <circle cx="250" cy="250" r="40" strokeWidth="2" />
        </svg>
      </div>

      {/* ── 3. Doctor Strange Second Mandala (Bottom Left Mirror) ── */}
      <div className="absolute -bottom-44 -left-44 w-[600px] h-[600px] opacity-20 animate-rune-rotate [animation-direction:reverse]">
        <svg viewBox="0 0 500 500" className="w-full h-full text-[var(--spider-cyan)] fill-none stroke-current stroke-1">
          <circle cx="250" cy="250" r="240" strokeDasharray="12 8" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="200" strokeWidth="1" />
          <polygon points="250,50 423,150 423,350 250,450 77,350 77,150" strokeWidth="1.5" />
          <circle cx="250" cy="250" r="120" strokeDasharray="6 4" strokeWidth="1.2" />
        </svg>
      </div>

      {/* ── 4. Web Tracer Grid Pattern Overlay ── */}
      <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* ── 5. Particle Canvas Layer ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
