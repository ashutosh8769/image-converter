'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Download, Sparkles } from 'lucide-react';
import { ConversionItem } from '@/types/converter';
import { formatBytes, getExtensionForFormat } from '@/utils/converter';

interface CompareModalProps {
  item: ConversionItem | null;
  onClose: () => void;
  onDownload: (item: ConversionItem) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  item,
  onClose,
  onDownload,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item || !item.avifUrl) return null;

  const targetExt = getExtensionForFormat(item.targetFormat).toUpperCase();
  const savingsPct = Math.round(
    ((item.originalSize - item.avifSize) / item.originalSize) * 100
  );

  const handlePointerMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handlePointerMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handlePointerMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-100 truncate max-w-md">
                {item.name}
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono">
                {savingsPct >= 0 ? `-${savingsPct}% saved` : `+${Math.abs(savingsPct)}%`}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Drag the center slider left and right to inspect quality
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onDownload(item)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {targetExt}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Comparison Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative flex-1 min-h-[400px] sm:min-h-[500px] bg-slate-950 select-none overflow-hidden checkerboard-pattern cursor-ew-resize flex items-center justify-center"
        >
          {/* Compressed Image (Background) */}
          <img
            src={item.avifUrl}
            alt="Compressed result"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Original Image (Clipped Foreground) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={item.previewUrl}
              alt="Original uncompressed"
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          {/* Center Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Grab Handle */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-indigo-600 text-white border-2 border-white shadow-xl flex items-center justify-center text-xs font-bold pointer-events-none">
              ↔
            </div>
          </div>

          {/* Left badge (Original) */}
          <div className="absolute top-4 left-4 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-200 font-mono shadow-lg">
            <span className="font-semibold text-slate-100">Original</span>
            <span className="text-slate-400 ml-2">{formatBytes(item.originalSize)}</span>
          </div>

          {/* Right badge (AVIF) */}
          <div className="absolute top-4 right-4 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-indigo-300 font-mono shadow-lg">
            <span className="font-semibold text-indigo-200">{targetExt}</span>
            <span className="text-indigo-400 ml-2">{formatBytes(item.avifSize)}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <span>Quality: {Math.round(item.quality * 100)}%</span>
          <span className="font-mono text-emerald-400">
            {savingsPct >= 0
              ? `Saved ${formatBytes(item.originalSize - item.avifSize)} (${savingsPct}%)`
              : 'File is larger than source'}
          </span>
        </div>
      </div>
    </div>
  );
};
