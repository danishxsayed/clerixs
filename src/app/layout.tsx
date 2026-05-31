import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://clerixs.com'),
  title: {
    default: 'Clerixs — Clinic Management Software',
    template: '%s | Clerixs',
  },
  description: 'The complete clinic management software for specialist clinics. Manage patients, appointments, prescriptions, lab reports and billing in one place.',
  keywords: ['clinic management software', 'hospital management', 'EMR India', 'dental clinic software', 'doctor software India'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://clerixs.com',
    siteName: 'Clerixs',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Clerixs Clinic Management' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@clerixs',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${outfit.className} antialiased`} suppressHydrationWarning>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
