import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AVIF Studio - Unlimited Offline Image Converter",
  description: "Next-generation client-side AVIF image converter. Convert JPG, PNG, WebP, and GIF images to ultra-compressed AVIF format completely offline with zero server uploads.",
  keywords: ["AVIF converter", "image optimizer", "client-side converter", "offline image compression", "nextjs image converter"],
  authors: [{ name: "AVIF Studio" }],
  openGraph: {
    title: "AVIF Studio - Unlimited Offline Image Converter",
    description: "Convert images to ultra-compressed AVIF format directly in your browser. 100% private and offline.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
