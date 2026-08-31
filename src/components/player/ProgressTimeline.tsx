'use client';

import React, { useState, useRef, useEffect } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const displayDuration = duration > 0 ? duration : 180;
  const effectiveTime = isDragging && dragTime !== null ? dragTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (effectiveTime / displayDuration) * 100));
  const bufferedPercent = Math.min(100, Math.max(0, (buffered / displayDuration) * 100));
  const remainingTime = Math.max(0, displayDuration - effectiveTime);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getSeekTimeFromEvent = (clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * displayDuration;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const newTime = getSeekTimeFromEvent(e.clientX);
    setDragTime(newTime);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverTime((x / rect.width) * displayDuration);
    setHoverX(x);

    if (isDragging) {
      const newTime = (x / rect.width) * displayDuration;
      setDragTime(newTime);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      const finalSeekTime = getSeekTimeFromEvent(e.clientX);
      onSeek(finalSeekTime);
      setIsDragging(false);
      setDragTime(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(0, currentTime - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(displayDuration, currentTime + 5));
    }
  };

  return (
    <div className={`space-y-1.5 w-full select-none ${className}`}>
      {/* Interactive Track Area with 24px Hit Buffer for Touch & Mouse */}
      <div
        ref={timelineRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => !isDragging && setHoverTime(null)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Seek progress timeline"
        aria-valuemin={0}
        aria-valuemax={displayDuration}
        aria-valuenow={effectiveTime}
        className="relative py-3 cursor-pointer group focus:outline-none"
      >
        {/* Track Bar Background */}
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative group-hover:h-2 transition-all">
          {/* Buffered Fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full transition-all duration-300 pointer-events-none"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played Progress Fill */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#DFFF00] rounded-full pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Thumb Handle on Hover / Dragging */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-[#DFFF00] shadow-[0_0_12px_rgba(223,255,0,0.8)] transition-transform pointer-events-none ${
            isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'
          }`}
          style={{ left: `calc(${progressPercent}% - 7px)` }}
        />

        {/* Hover Time Tooltip */}
        {hoverTime !== null && !isDragging && (
          <div
            className="absolute -top-6 transform -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#171A21] border border-white/20 text-[10px] font-semibold text-white pointer-events-none shadow-lg"
            style={{ left: `${hoverX}px` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* Time Labels */}
      <div className="flex items-center justify-between text-xs font-medium text-[#9AA1AD] px-0.5">
        <span>{formatTime(effectiveTime)}</span>
        <span>-{formatTime(remainingTime)}</span>
      </div>
    </div>
  );
}
