'use client';

import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Shield, Cpu, Layers } from 'lucide-react';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support Ctrl+V paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (!e.clipboardData || !e.clipboardData.items) return;

      const files: File[] = [];
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        const item = e.clipboardData.items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        onFilesSelected(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, onFilesSelected]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-selecting the exact same files works
      e.target.value = '';
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer rounded-3xl p-8 sm:p-14 text-center transition-all duration-300 overflow-hidden border-2 border-dashed ${
        isDragOver
          ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01] shadow-2xl shadow-indigo-500/20 ring-4 ring-indigo-500/20'
          : 'border-slate-800 hover:border-indigo-500/80 bg-slate-900/40 hover:bg-slate-900/70 shadow-xl'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Background ambient decorative light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-500"></div>

      <div className="relative z-10 flex flex-col items-center justify-center max-w-xl mx-auto">
        {/* Animated Icon Container */}
        <div className="w-18 h-18 rounded-2xl bg-indigo-600/15 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner border border-indigo-500/20">
          <UploadCloud className="w-9 h-9" />
        </div>

        {/* Text */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
          Drop images here or <span className="text-indigo-400 underline underline-offset-4 decoration-indigo-500/60 hover:text-indigo-300">browse files</span>
        </h2>

        <p className="text-sm text-slate-400 mt-2">
          Supports JPG, PNG, WebP, AVIF, TIFF, BMP, SVG, & GIF. Convert between any format. Or press <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-indigo-300">Ctrl + V</kbd> to paste.
        </p>

        {/* Badges / Highlights */}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80 font-medium">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            100% Private & In-Memory
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80 font-medium">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            Zero Server Latency
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/80 font-medium">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Unlimited Batch Queue
          </span>
        </div>
      </div>
    </div>
  );
};
