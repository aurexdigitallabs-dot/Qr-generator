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
  title: 'BrandQR — Branded QR Code Generator by Aurex Digitals',
  description:
    'Create customized QR codes with your brand logo, colors, and downloadable formats using BrandQR by Aurex Digitals. Smart QR Codes. Your Brand.',
  keywords: [
    'BrandQR',
    'Aurex Digitals',
    'QR Code Generator',
    'Custom QR Code with Logo',
    'Vector QR Code SVG',
    'Brand Identity QR',
    'Wi-Fi QR Code',
    'vCard QR Code',
    'High Resolution QR',
  ],
  authors: [{ name: 'Aurex Digitals', url: 'https://aurexdigitals.com' }],
  creator: 'Aurex Digitals',
  publisher: 'Aurex Digitals',
  icons: {
    icon: [
      { url: '/Aurex%20icon%20only.png', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/Aurex%20icon%20only.png',
    apple: [
      { url: '/Aurex%20icon%20only.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'BrandQR — Branded QR Code Generator by Aurex Digitals',
    description:
      'Create customized QR codes with your brand logo, colors, and downloadable formats using BrandQR by Aurex Digitals.',
    type: 'website',
    siteName: 'BrandQR by Aurex Digitals',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FF6B2C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-[#FAFAFA] text-[#171717]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
