import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "Darsa Enterprise - Ma'had Darussa'adah Lirboyo Kota Kediri",
  description:
    "Sistem Informasi Terpadu Enterprise Pendidikan Islam - Ma'had Darussa'adah Lirboyo Kota Kediri",
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
      </body>
    </html>
  );
}
