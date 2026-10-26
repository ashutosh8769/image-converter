'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowRightLeft,
  FileImage,
} from 'lucide-react';
import { SupportedFormat, FORMAT_OPTIONS } from '@/types/converter';

interface HeaderProps {
  isCanvasAvifSupported: boolean | null;
  targetFormat: SupportedFormat;
  onFormatChange: (format: SupportedFormat) => void;
  onApplyToAll?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isCanvasAvifSupported,
  targetFormat,
  onFormatChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = FORMAT_OPTIONS.find((f) => f.format === targetFormat) || FORMAT_OPTIONS[0];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white font-black text-xl tracking-tighter">
              <FileImage className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-bold text-xl leading-tight tracking-tight text-white flex items-center gap-2">
                OmniConvert
                <span className="text-[10px] font-mono tracking-normal uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                  Universal
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                100% Offline & Private
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden md:block">
              Convert any image format to AVIF, WebP, PNG, JPEG, TIFF, or GIF
            </p>
          </div>
        </div>

        {/* Right side controls: Universal Format Picker */}
        <div className="flex items-center gap-3">
          {/* Universal Format Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/80 text-slate-100 text-xs font-semibold shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-normal">Convert to:</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold tracking-wide">
                  {currentOption.label}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Target Output Format
                  </span>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-400" />
                </div>

                <div className="space-y-1">
                  {FORMAT_OPTIONS.map((opt) => {
                    const isSelected = opt.format === targetFormat;
                    return (
                      <button
                        key={opt.format}
                        onClick={() => {
                          onFormatChange(opt.format);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                            : 'hover:bg-slate-800/70 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100">{opt.label}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              .{opt.ext}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            {opt.description}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800/80 text-slate-400'
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Engine Status Badge */}
          {isCanvasAvifSupported !== null && (
            <div className="hidden lg:flex text-xs px-3 py-2 rounded-xl border font-medium items-center gap-2 bg-emerald-500/10 border-emerald-500/30 text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Format Engine Ready</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
