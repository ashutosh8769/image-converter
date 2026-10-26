import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OmniConvert - Universal Image Converter',
    short_name: 'OmniConvert',
    description: '100% private, ultra-fast offline image converter for AVIF, WebP, PNG, JPEG, TIFF, and GIF',
    start_url: '/',
    display: 'standalone',
    background_color: '#030712',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
