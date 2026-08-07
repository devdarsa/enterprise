import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#047857',
};

export const metadata: Metadata = {
  title: "Darsa Enterprise - Ma'had Darussa'adah Lirboyo Kota Kediri",
  description:
    "Sistem Informasi Terpadu Enterprise Pendidikan Islam - Ma'had Darussa'adah Lirboyo Kota Kediri",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Darsa Enterprise',
  },
  icons: {
    icon: [
      { url: '/logo-lirboyo.png', type: 'image/png' },
    ],
    shortcut: '/logo-lirboyo.png',
    apple: '/logo-lirboyo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
