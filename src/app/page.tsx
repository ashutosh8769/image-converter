'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import {
  Images,
  Sparkles,
  TrendingDown,
  Layers,
  HardDrive,
  CheckCircle,
} from 'lucide-react';

import { Header } from '@/components/Header';
import { DropZone } from '@/components/DropZone';
import { SettingsBar } from '@/components/SettingsBar';
import { ImageCard } from '@/components/ImageCard';
import { CompareModal } from '@/components/CompareModal';
import { ToastContainer } from '@/components/Toast';

import {
  ConversionItem,
  ConverterConfig,
  SupportedFormat,
  ToastNotification,
  FORMAT_OPTIONS,
} from '@/types/converter';
import {
  checkNativeCanvasAvifSupport,
  convertImage,
  formatBytes,
  getBaseFileName,
  getExtensionForFormat,
} from '@/utils/converter';

export default function Home() {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isCanvasAvifSupported, setIsCanvasAvifSupported] = useState<boolean | null>(null);
  const [compareItem, setCompareItem] = useState<ConversionItem | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Default configuration
  const [config, setConfig] = useState<ConverterConfig>({
    quality: 80,
    targetFormat: 'image/avif',
    scale: 1,
    maxWidth: 0,
  });

  // Reference to items for async worker
  const itemsRef = useRef<ConversionItem[]>(items);
  itemsRef.current = items;

  // Add toast helper
  const addToast = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check hardware AVIF canvas support on mount
  useEffect(() => {
    checkNativeCanvasAvifSupport().then((supported) => {
      setIsCanvasAvifSupported(supported);
    });
  }, []);

  // Handle incoming files with comprehensive format recognition
  const handleFilesSelected = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList).filter((f) => {
        const hasImageMime = f.type && f.type.startsWith('image/');
        const hasImageExt = /\.(jpe?g|png|webp|avif|gif|tiff?|bmp|svg|heic|heif|ico)$/i.test(f.name);
        return hasImageMime || hasImageExt;
      });

      if (incoming.length === 0) {
        addToast('Please select valid image files (JPG, PNG, WebP, AVIF, TIFF, GIF, etc.).', 'error');
        return;
      }

      const newItems: ConversionItem[] = incoming.map((file) => {
        const previewUrl = URL.createObjectURL(file);
        return {
          id: 'img_' + Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          baseName: getBaseFileName(file.name),
          originalSize: file.size,
          originalWidth: 0,
          originalHeight: 0,
          previewUrl,
          avifBlob: null,
          avifUrl: null,
          avifSize: 0,
          status: 'pending',
          quality: config.quality / 100,
          targetFormat: config.targetFormat,
          scale: config.scale,
          savings: 0,
        };
      });

      setItems((prev) => [...newItems, ...prev]);
      addToast(`Added ${newItems.length} images to queue`, 'info');
    },
    [config.quality, config.targetFormat, config.scale, addToast]
  );

  // Conversion queue processor
  const isConvertingRef = useRef(false);

  useEffect(() => {
    if (isConvertingRef.current) return;

    const pendingItem = items.find((i) => i.status === 'pending');
    if (!pendingItem) return;

    isConvertingRef.current = true;
    setIsConverting(true);

    // Update status to converting
    setItems((prev) =>
      prev.map((i) => (i.id === pendingItem.id ? { ...i, status: 'converting' } : i))
    );

    convertImage(pendingItem.file, {
      quality: pendingItem.quality,
      targetFormat: pendingItem.targetFormat,
      scale: pendingItem.scale,
      maxWidth: config.maxWidth,
    })
      .then(({ blob, size, width, height }) => {
        const avifUrl = URL.createObjectURL(blob);
        const savings = Math.max(
          0,
          ((pendingItem.originalSize - size) / pendingItem.originalSize) * 100
        );

        setItems((prev) =>
          prev.map((i) =>
            i.id === pendingItem.id
              ? {
                  ...i,
                  status: 'done',
                  avifBlob: blob,
                  avifUrl,
                  avifSize: size,
                  originalWidth: width,
                  originalHeight: height,
                  savings,
                }
              : i
          )
        );

        // Check if all pending were completed to fire celebratory confetti
        const remainingPending = itemsRef.current.filter(
          (i) => i.status === 'pending' && i.id !== pendingItem.id
        );
        if (remainingPending.length === 0) {
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#06b6d4', '#10b981'],
          });
        }
      })
      .catch((err) => {
        console.error('Conversion failed:', err);
        setItems((prev) =>
          prev.map((i) =>
            i.id === pendingItem.id
              ? { ...i, status: 'error', errorMessage: err?.message || 'Conversion failed' }
              : i
          )
        );
      })
      .finally(() => {
        isConvertingRef.current = false;
        setIsConverting(false);
      });
  }, [items, config.maxWidth]);

  // Download single item
  const handleDownloadSingle = useCallback(
    (item: ConversionItem) => {
      if (!item.avifBlob) return;

      const ext = getExtensionForFormat(item.targetFormat);
      const url = URL.createObjectURL(item.avifBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.baseName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast(`Downloaded ${item.baseName}.${ext}`, 'success');
    },
    [addToast]
  );

  // Remove single item
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.avifUrl) URL.revokeObjectURL(target.avifUrl);
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  // Clear all items
  const handleClearAll = useCallback(() => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      if (item.avifUrl) URL.revokeObjectURL(item.avifUrl);
    });
    setItems([]);
    addToast('Queue cleared', 'info');
  }, [items, addToast]);

  // Change target format for a specific item
  const handleItemFormatChange = useCallback(
    (item: ConversionItem, newFormat: SupportedFormat) => {
      if (item.avifUrl) URL.revokeObjectURL(item.avifUrl);
      const ext = getExtensionForFormat(newFormat).toUpperCase();

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'pending',
                avifBlob: null,
                avifUrl: null,
                avifSize: 0,
                targetFormat: newFormat,
              }
            : i
        )
      );
      addToast(`Converting ${item.name} to ${ext}...`, 'info');
    },
    [addToast]
  );

  // Re-convert item with latest quality or configuration
  const handleReconvert = useCallback(
    (item: ConversionItem) => {
      if (item.avifUrl) URL.revokeObjectURL(item.avifUrl);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: 'pending',
                avifBlob: null,
                avifUrl: null,
                avifSize: 0,
                quality: config.quality / 100,
                targetFormat: config.targetFormat,
                scale: config.scale,
              }
            : i
        )
      );
      addToast(`Re-converting ${item.name} with ${config.quality}% quality...`, 'info');
    },
    [config.quality, config.targetFormat, config.scale, addToast]
  );

  // Download all completed items as a ZIP
  const handleDownloadZip = useCallback(async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.avifBlob);
    if (doneItems.length === 0) return;

    try {
      setIsZipping(true);
      const zip = new JSZip();
      const usedNames = new Set<string>();

      doneItems.forEach((item) => {
        const ext = getExtensionForFormat(item.targetFormat);
        let fileName = `${item.baseName}.${ext}`;
        let counter = 1;
        while (usedNames.has(fileName)) {
          fileName = `${item.baseName}_${counter}.${ext}`;
          counter++;
        }
        usedNames.add(fileName);
        zip.file(fileName, item.avifBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_images_${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast(`ZIP downloaded with ${doneItems.length} converted images!`, 'success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('ZIP generation failed:', err);
      addToast('Failed to create ZIP file', 'error');
    } finally {
      setIsZipping(false);
    }
  }, [items, addToast]);

  // Summary statistics
  const doneItems = items.filter((i) => i.status === 'done');
  const totalOriginalBytes = doneItems.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalConvertedBytes = doneItems.reduce((acc, curr) => acc + curr.avifSize, 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalConvertedBytes);
  const totalSavingsPct =
    totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navigation Header */}
      <Header
        isCanvasAvifSupported={isCanvasAvifSupported}
        targetFormat={config.targetFormat}
        onFormatChange={(targetFormat) => {
          setConfig((prev) => ({ ...prev, targetFormat }));
          const opt = FORMAT_OPTIONS.find((f) => f.format === targetFormat);
          addToast(`Target format set to ${opt?.label || targetFormat} (.${opt?.ext || ''})`, 'info');
        }}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Metric Cards (when images exist) */}
        {doneItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-300">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Processed Images</p>
                <p className="text-lg font-bold text-slate-100">
                  {doneItems.length} of {items.length} done
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Size Reduced</p>
                <p className="text-lg font-bold text-slate-100">
                  {formatBytes(totalOriginalBytes)} &rarr;{' '}
                  <span className="text-cyan-400">{formatBytes(totalConvertedBytes)}</span>
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Net Space Saved</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatBytes(totalSavedBytes)} ({totalSavingsPct}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compression & Batch Settings Bar */}
        <SettingsBar
          config={config}
          onConfigChange={(newCfg) => setConfig((prev) => ({ ...prev, ...newCfg }))}
          totalFiles={items.length}
          completedFiles={doneItems.length}
          isZipping={isZipping}
          onDownloadZip={handleDownloadZip}
          onClearAll={handleClearAll}
        />

        {/* Drag & Drop Zone */}
        <DropZone onFilesSelected={handleFilesSelected} />

        {/* Conversion Queue / Results Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <span>Conversion Queue</span>
              {items.length > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {items.length}
                </span>
              )}
            </h2>

            {doneItems.length > 0 && (
              <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <span>Overall:</span>
                <strong className="text-emerald-400 font-bold">-{totalSavingsPct}%</strong>
                <span>({formatBytes(totalSavedBytes)} saved)</span>
              </div>
            )}
          </div>

          {/* Empty State */}
          {items.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-600 mb-3 border border-slate-800">
                <Images className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">No images converted yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Drop your photos, screenshots, or artwork above to convert them between any image formats.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <ImageCard
                  key={item.id}
                  item={item}
                  onDownload={handleDownloadSingle}
                  onRemove={handleRemoveItem}
                  onCompare={(it) => setCompareItem(it)}
                  onReconvert={handleReconvert}
                  onFormatChange={handleItemFormatChange}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Interactive Split Comparison Modal */}
      <CompareModal
        item={compareItem}
        onClose={() => setCompareItem(null)}
        onDownload={handleDownloadSingle}
      />

      {/* Toast Notification Queue */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
