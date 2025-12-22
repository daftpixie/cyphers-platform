import type { Metadata, Viewport } from 'next';
import { Orbitron, Space_Grotesk, DM_Sans, Space_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Font configurations
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Cyphers | 1,000 On-Chain Identities on Dogecoin',
  description: 'Privacy is Punk. AI-generated Cypherpunk NFTs inscribed permanently on the Dogecoin blockchain via Doginals.',
  keywords: ['NFT', 'Dogecoin', 'Doginals', 'Cypherpunk', 'AI Art', 'Privacy', 'Blockchain'],
  authors: [{ name: '24HRMVP' }],
  openGraph: {
    title: 'The Cyphers | On-Chain Identities',
    description: 'Privacy is Punk. 1,000 AI-generated Cypherpunk identities inscribed on Dogecoin.',
    url: 'https://punks.24hrmvp.xyz',
    siteName: 'The Cyphers',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'The Cyphers - Cypherpunk NFT Collection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Cyphers | On-Chain Identities',
    description: 'Privacy is Punk. 1,000 AI-generated Cypherpunk identities on Dogecoin.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0E27',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${orbitron.variable} ${spaceGrotesk.variable} ${dmSans.variable} ${spaceMono.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Matrix background effect */}
        <div className="fixed inset-0 matrix-bg pointer-events-none z-0" />
        
        {/* Main content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        
        {/* Scan lines overlay */}
        <div className="fixed inset-0 pointer-events-none z-50 scan-lines opacity-30" />
      </body>
    </html>
  );
}
