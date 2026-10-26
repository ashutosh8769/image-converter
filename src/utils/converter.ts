import { SupportedFormat } from '@/types/converter';

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

export function getBaseFileName(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  return lastDot === -1 ? filename : filename.substring(0, lastDot);
}

export function getExtensionForFormat(format: SupportedFormat): string {
  switch (format) {
    case 'image/avif':
      return 'avif';
    case 'image/webp':
      return 'webp';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/tiff':
      return 'tiff';
    case 'image/gif':
      return 'gif';
    default:
      return 'avif';
  }
}

/**
 * Checks if the browser's HTMLCanvasElement can natively export to AVIF
 */
export async function checkNativeCanvasAvifSupport(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      canvas.toBlob((blob) => {
        resolve(Boolean(blob && blob.type === 'image/avif'));
      }, 'image/avif');
    } catch {
      resolve(false);
    }
  });
}

/**
 * Converts an image file using the local high-performance Next.js engine (/api/convert)
 * Sharp automatically inspects image binary headers (magic bytes) to detect any format.
 */
async function convertViaLocalApi(
  file: File,
  options: {
    quality: number; // 0.05 to 1.0
    targetFormat: SupportedFormat;
    scale?: number;
    maxWidth?: number;
  }
): Promise<{
  blob: Blob;
  size: number;
  width: number;
  height: number;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', Math.round(options.quality * 100).toString());
  formData.append('targetFormat', options.targetFormat);
  if (options.scale && options.scale < 1) {
    formData.append('scale', options.scale.toString());
  }
  if (options.maxWidth && options.maxWidth > 0) {
    formData.append('maxWidth', options.maxWidth.toString());
  }

  const response = await fetch('/api/convert', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Conversion failed with HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const width = parseInt(response.headers.get('X-Converted-Width') || '0', 10);
  const height = parseInt(response.headers.get('X-Converted-Height') || '0', 10);

  return {
    blob,
    size: blob.size,
    width,
    height,
  };
}

/**
 * Fallback converter using HTML5 Canvas
 */
async function convertViaCanvas(
  file: File,
  options: {
    quality: number;
    targetFormat: SupportedFormat;
    scale?: number;
    maxWidth?: number;
  }
): Promise<{
  blob: Blob;
  size: number;
  width: number;
  height: number;
}> {
  const { quality, targetFormat, scale = 1, maxWidth = 0 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (scale < 1 && scale > 0) {
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        if (maxWidth > 0 && width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob && (blob.type === targetFormat || blob.size > 0)) {
              resolve({
                blob,
                size: blob.size,
                width,
                height,
              });
            } else {
              reject(new Error(`Browser canvas cannot export to ${targetFormat}`));
            }
          },
          targetFormat,
          quality
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image file'));
    };

    img.src = objectUrl;
  });
}

/**
 * Main conversion entry point:
 * 1. Uses local high-performance Sharp engine (automatically detects input format from bytes).
 * 2. Falls back to Canvas if the local API is unreachable.
 */
export async function convertImage(
  file: File,
  options: {
    quality: number; // 0.05 to 1.0
    targetFormat?: SupportedFormat;
    scale?: number; // 0.1 to 1.0
    maxWidth?: number;
  }
): Promise<{
  blob: Blob;
  size: number;
  width: number;
  height: number;
}> {
  const { quality, targetFormat = 'image/avif', scale = 1, maxWidth = 0 } = options;

  try {
    // Primary: Sharp via local Next.js engine
    return await convertViaLocalApi(file, {
      quality,
      targetFormat,
      scale,
      maxWidth,
    });
  } catch (apiErr) {
    console.warn('API conversion failed, trying canvas fallback:', apiErr);
    // Secondary fallback: Canvas
    return await convertViaCanvas(file, {
      quality,
      targetFormat,
      scale,
      maxWidth,
    });
  }
}
