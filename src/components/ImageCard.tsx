'use client';

import React from 'react';
import {
  Download,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';
import { ConversionItem, SupportedFormat, FORMAT_OPTIONS } from '@/types/converter';
import { formatBytes, getFileExtension, getExtensionForFormat } from '@/utils/converter';

interface ImageCardProps {
  item: ConversionItem;
  onDownload: (item: ConversionItem) => void;
  onRemove: (id: string) => void;
  onCompare: (item: ConversionItem) => void;
  onReconvert: (item: ConversionItem) => void;
  onFormatChange?: (item: ConversionItem, format: SupportedFormat) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  item,
  onDownload,
  onRemove,
  onCompare,
  onReconvert,
  onFormatChange,
}) => {
  const isDone = item.status === 'done';
  const isError = item.status === 'error';
  const isConverting = item.status === 'converting';

  const origExt = getFileExtension(item.name).toUpperCase() || 'IMG';
  const targetExt = getExtensionForFormat(item.targetFormat).toUpperCase();

  const savingsPct = isDone
    ? Math.round(((item.originalSize - item.avifSize) / item.originalSize) * 100)
    : 0;
  const isSmaller = isDone && item.avifSize < item.originalSize;

  return (
    <div className="group bg-slate-900/80 hover:bg-slate-900/95 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md">
      {/* Left: Thumbnail & Details */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Thumbnail Preview */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 border border-slate-800 checkerboard-pattern relative flex items-center justify-center shadow-inner">
          {item.previewUrl ? (
            <img
              src={item.previewUrl}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">
              <Sparkles className="w-6 h-6" />
            </div>
          )}

          {/* Converting Overlay Spinner */}
          {isConverting && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        {/* File Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-semibold text-sm text-slate-100 truncate max-w-[200px] sm:max-w-xs md:max-w-sm"
              title={item.name}
            >
              {item.name}
            </span>

            {/* Interactive Format Transition Badge */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shadow-sm">
              <span className="font-semibold text-slate-400">{origExt}</span>
              <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
              <div className="relative inline-flex items-center">
                <select
                  value={item.targetFormat}
                  onChange={(e) => onFormatChange?.(item, e.target.value as SupportedFormat)}
                  className="bg-transparent text-indigo-400 font-bold focus:outline-none cursor-pointer pr-3 appearance-none hover:text-indigo-300 transition-colors uppercase text-[11px]"
                  title="Click to change target format for this image"
                >
                  {FORMAT_OPTIONS.map((f) => (
                    <option key={f.format} value={f.format} className="bg-slate-900 text-slate-100 font-sans">
                      {f.label} (.{f.ext})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-2.5 h-2.5 text-indigo-400 absolute right-0 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-400 mt-1.5 font-mono">
            <span>
              Original:{' '}
              <strong className="text-slate-300 font-medium">
                {formatBytes(item.originalSize)}
              </strong>
            </span>

            {isDone && (
              <>
                <span className="text-slate-600">&bull;</span>
                <span>
                  {targetExt}:{' '}
                  <strong className="text-indigo-300 font-bold">
                    {formatBytes(item.avifSize)}
                  </strong>
                </span>
                <span className="text-slate-600">&bull;</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isSmaller
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {isSmaller
                    ? `-${savingsPct}% saved`
                    : `+${Math.abs(savingsPct)}% larger`}
                </span>
              </>
            )}

            {isConverting && (
              <span className="text-indigo-400 flex items-center gap-1 font-sans">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Converting to {targetExt} ({Math.round(item.quality * 100)}% quality)...
              </span>
            )}

            {isError && (
              <span className="text-rose-400 flex items-center gap-1 font-sans">
                <AlertCircle className="w-3.5 h-3.5" />
                {item.errorMessage || 'Conversion failed'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions Group */}
      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80 w-full md:w-auto justify-end">
        {/* Compare Split Button */}
        {isDone && (
          <button
            onClick={() => onCompare(item)}
            title="Compare Before vs After"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700/80 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Compare</span>
          </button>
        )}

        {/* Re-convert button */}
        {(isDone || isError) && (
          <button
            onClick={() => onReconvert(item)}
            title="Re-convert"
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {/* Download Button - Placed directly just before Delete button */}
        <button
          onClick={() => isDone && onDownload(item)}
          disabled={!isDone}
          title={isDone ? `Download ${targetExt}` : 'Processing...'}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all ${
            isDone
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer border border-indigo-500/30'
              : 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save {targetExt}</span>
        </button>

        {/* Delete / Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          title="Remove from queue"
          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
