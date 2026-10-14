import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BrandQR Studio — Professional Vector & Logo QR Code Generator',
  description:
    'Generate customized, high-resolution QR codes with brand logos, custom colors, dot patterns, error-correction safety, and export in PNG or SVG vector formats.',
  keywords: [
    'QR Code Generator',
    'Custom QR Code with Logo',
    'Vector QR Code SVG',
    'Brand Identity QR',
    'Wi-Fi QR Code',
    'vCard QR Code',
    'High Resolution QR',
  ],
  authors: [{ name: 'BrandQR Studio' }],
  openGraph: {
    title: 'BrandQR Studio — Professional Vector & Logo QR Code Generator',
    description:
      'Generate customized, high-resolution QR codes with brand logos, custom colors, dot patterns, and SVG export.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
