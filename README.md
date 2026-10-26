# AVIF Studio - Next.js & Tailwind CSS Image Converter

A next-generation, client-side, 100% private and offline image converter built with **Next.js (App Router)** and **Tailwind CSS**.

Converted from the standalone HTML tool (`avif_image_converter.html`) into a modern, type-safe, and feature-packed web application.

---

## ✨ Features

- **100% In-Browser & Offline**: All compression is performed directly in the browser using HTML5 Canvas with native hardware encoder support. Zero images are ever uploaded to any server.
- **AVIF & WebP Formats**: Convert between modern web image formats with one-click toggling.
- **Interactive Split Comparison**: Side-by-side Before vs. After split slider to inspect compression fidelity.
- **Clipboard Paste Support**: Press <kbd>Ctrl + V</kbd> anywhere on the page to paste and convert screenshots instantly.
- **Batch Processing & ZIP Download**: Convert hundreds of images simultaneously and download all results in a single structured ZIP file via JSZip.
- **Quality Presets & Scaling**: Quick presets (35%, 65%, 80%, 95%) and optional dimension scaling (100%, 75%, 50%).
- **Live Statistics**: Real-time tracking of original sizes, converted sizes, and total net disk savings.
- **Dark Glassmorphic UI**: High-end modern design tailored with Tailwind CSS, custom scrollbars, and smooth animations.

---

## 🚀 Getting Started

The development server is pre-configured to run on **port 3002** (leaving ports 3000 and 3001 free):

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Visit [http://localhost:3002](http://localhost:3002) in your browser.
