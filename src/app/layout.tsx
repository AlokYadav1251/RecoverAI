import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { RecoverAIProvider } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'RecoverAI — Autonomous AI Revenue Recovery Agent (Razorpay Track 03)',
  description: 'Find revenue that is slipping away and win it back autonomously with bounded AI recovery workflows.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <RecoverAIProvider>
          <AppShell>
            {children}
          </AppShell>
        </RecoverAIProvider>
      </body>
    </html>
  );
}
