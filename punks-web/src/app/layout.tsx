import type { Metadata, Viewport } from 'next';
import { Orbitron, Space_Grotesk, DM_Sans, Space_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PlausibleMultiDomain } from '@/components/analytics/PlausibleProvider';

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
  metadataBase: new URL('https://punks.24hrmvp.xyz'),
  title: {
    default: 'The Cyphers | Encrypted Identities on Dogecoin',
    template: '%s | The Cyphers',
  },
  description: 'Join the elite network of Web3 builders. Privacy is Punk. 1,000 AI-generated Cypherpunk identities inscribed permanently on Dogecoin via Doginals.',
  keywords: ['NFT', 'Dogecoin', 'Doginals', 'Cypherpunk', 'AI Art', 'Privacy', 'Blockchain', 'Web3', 'Identity', 'Builders'],
  authors: [{ name: '24HRMVP' }],
  creator: '24HRMVP',
  publisher: '24HRMVP',
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://punks.24hrmvp.xyz',
    title: 'The Cyphers | Encrypted Identities',
    description: 'Join the elite network of Web3 builders. Privacy is Punk. 1,000 AI-generated Cypherpunk identities on Dogecoin.',
    siteName: 'The Cyphers',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'The Cyphers - Privacy is Punk',
      },
      {
        url: '/og-square.png',
        width: 1080,
        height: 1080,
        alt: 'The Cyphers - Square Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Cyphers | Encrypted Identities',
    description: 'Join the elite network of Web3 builders. Privacy is Punk. 1,000 AI-generated Cypherpunk identities on Dogecoin.',
    images: ['/twitter-image.png'],
    creator: '@24HRMVP',
    site: '@24HRMVP',
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
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to analytics for faster tracking */}
        <link rel="preconnect" href="https://analytics.24hrmvp.xyz" />
        
        {/* Plausible Analytics (self-hosted, privacy-first) */}
        {/* Tracks to both punks.24hrmvp.xyz and all.24hrmvp.xyz aggregate dashboard */}
        <PlausibleMultiDomain domains={['punks.24hrmvp.xyz', 'all.24hrmvp.xyz']} />
      </head>
      <body className="min-h-screen flex flex-col bg-void text-text-primary antialiased">
        {/* Matrix background effect */}
        <div className="fixed inset-0 matrix-bg pointer-events-none z-0" />
        
        {/* Ambient background effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl" />
        </div>
        
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
