'use client';

import React, { useState, useRef } from 'react';

interface ProgressTimelineProps {
  currentTime: number;
  duration: number;
  buffered?: number;
  onSeek: (newTime: number) => void;
  className?: string;
}

export default function ProgressTimeline({
  currentTime,
  duration,
  buffered = 0,
  onSeek,
  className = '',
}: ProgressTimelineProps) {
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const displayDuration = duration > 0 ? duration : 260;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / displayDuration) * 100));
  const bufferedPercent = Math.min(100, Math.max(0, (buffered / displayDuration) * 100));

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    setHoverTime(percentage * displayDuration);
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekTime = Math.max(0, Math.min((clickX / rect.width) * displayDuration, displayDuration));
    onSeek(seekTime);
  };

  return (
    <div className={`space-y-1.5 w-full select-none ${className}`}>
      {/* Interactive Track Area with Invisible Click Buffer for Touch/Mouse */}
      <div
        ref={timelineRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative py-2 cursor-pointer group"
        role="slider"
        aria-label="Progress timeline"
        aria-valuemin={0}
        aria-valuemax={displayDuration}
        aria-valuenow={currentTime}
      >
        {/* Track Background */}
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative group-hover:h-2 transition-all">
          {/* Buffered Fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full transition-all duration-300"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played Progress Fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#00D9FF] via-[#6D3BFF] to-[#FF2D9A] rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Thumb Handle on Hover / Touch */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_10px_#00D9FF] scale-0 group-hover:scale-100 transition-transform pointer-events-none"
          style={{ left: `calc(${progressPercent}% - 7px)` }}
        />

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] font-mono font-bold text-white pointer-events-none"
            style={{ left: `${hoverX}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Timestamp Indicators (Spec 103) */}
      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white/50">
        <span className="text-[#00D9FF]">{formatTime(currentTime)}</span>
        <span>{formatTime(displayDuration)}</span>
      </div>
    </div>
  );
}
