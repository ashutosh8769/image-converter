'use client';

import React from 'react';
import { Sliders, Archive, Trash2, CheckCircle, Sparkles, Maximize2, ArrowRightLeft } from 'lucide-react';
import { ConverterConfig, FORMAT_OPTIONS } from '@/types/converter';

interface SettingsBarProps {
  config: ConverterConfig;
  onConfigChange: (newConfig: Partial<ConverterConfig>) => void;
  totalFiles: number;
  completedFiles: number;
  isZipping: boolean;
  onDownloadZip: () => void;
  onClearAll: () => void;
}

export const SettingsBar: React.FC<SettingsBarProps> = ({
  config,
  onConfigChange,
  totalFiles,
  completedFiles,
  isZipping,
  onDownloadZip,
  onClearAll,
}) => {
  const presets = [
    { label: '35% Max Saving', value: 35 },
    { label: '65% Balanced', value: 65 },
    { label: '80% High Quality', value: 80 },
    { label: '95% Crisp', value: 95 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Compression & Format Control Panel */}
      <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur-md flex flex-col justify-between gap-5">
        {/* Output Format Picker Row */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
                Target Output Format
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Applies to all incoming conversions
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {FORMAT_OPTIONS.map((opt) => {
              const isSelected = config.targetFormat === opt.format;
              return (
                <button
                  key={opt.format}
                  onClick={() => onConfigChange({ targetFormat: opt.format })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
                  }`}
                >
                  <span className="font-bold text-xs tracking-wide">{opt.label}</span>
                  <span
                    className={`text-[9px] mt-0.5 ${
                      isSelected ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    .{opt.ext}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Header & Slider */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <label htmlFor="qualityRange" className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
                Compression Quality
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold">
                {config.quality}%
              </span>
            </div>
          </div>

          <input
            id="qualityRange"
            type="range"
            min="5"
            max="100"
            step="1"
            value={config.quality}
            onChange={(e) => onConfigChange({ quality: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 transition-all focus:outline-none hover:accent-indigo-400"
          />

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => onConfigChange({ quality: preset.value })}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  config.quality === preset.value
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Dimension Scaling */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Resize Scale:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[
              { label: 'Original (100%)', scale: 1 },
              { label: '75%', scale: 0.75 },
              { label: '50%', scale: 0.5 },
            ].map((s) => (
              <button
                key={s.scale}
                onClick={() => onConfigChange({ scale: s.scale })}
                className={`px-2.5 py-1 rounded-md font-mono transition-all cursor-pointer ${
                  config.scale === s.scale
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batch Operations Card */}
      <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur-md flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Batch Queue
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {totalFiles} {totalFiles === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {completedFiles} of {totalFiles} completed and ready to download.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {/* Download ZIP Button */}
          <button
            onClick={onDownloadZip}
            disabled={completedFiles === 0 || isZipping}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
          >
            {isZipping ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Compressing ZIP...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Download All as ZIP ({completedFiles})</span>
              </>
            )}
          </button>

          {/* Clear All Button */}
          <button
            onClick={onClearAll}
            disabled={totalFiles === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-800/60 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-400 text-slate-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
