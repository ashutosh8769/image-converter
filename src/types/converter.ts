export type SupportedFormat =
  | 'image/avif'
  | 'image/webp'
  | 'image/jpeg'
  | 'image/png'
  | 'image/tiff'
  | 'image/gif';

export interface FormatOption {
  format: SupportedFormat;
  label: string;
  ext: string;
  description: string;
  badge: string;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { format: 'image/avif', label: 'AVIF', ext: 'avif', description: 'Next-Gen Ultra Compression', badge: 'Next-Gen' },
  { format: 'image/webp', label: 'WebP', ext: 'webp', description: 'Universal Web Standard', badge: 'Fast & Light' },
  { format: 'image/png', label: 'PNG', ext: 'png', description: 'Lossless with Alpha Channel', badge: 'Lossless' },
  { format: 'image/jpeg', label: 'JPEG', ext: 'jpg', description: 'Universal Photo Compatibility', badge: 'Universal' },
  { format: 'image/tiff', label: 'TIFF', ext: 'tiff', description: 'High Bit-depth Archive/Print', badge: 'Print/Raw' },
  { format: 'image/gif', label: 'GIF', ext: 'gif', description: 'Static / Animated Graphics', badge: 'Classic' },
];

export interface ConversionItem {
  id: string;
  file: File;
  name: string;
  baseName: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  previewUrl: string;
  avifBlob: Blob | null;
  avifUrl: string | null;
  avifSize: number;
  status: 'pending' | 'converting' | 'done' | 'error';
  errorMessage?: string;
  quality: number; // 0.05 to 1.0
  targetFormat: SupportedFormat;
  scale: number; // 1 = 100%, 0.75, 0.5, etc.
  savings: number; // percentage
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export interface ConverterConfig {
  quality: number; // 5 to 100
  targetFormat: SupportedFormat;
  scale: number; // 0.25 to 1
  maxWidth: number; // 0 = unlimited
}
