// layout.tsx
import type { Metadata, Viewport } from "next";
import { Orbitron, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Font configurations
const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-orbitron",
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk",
  display: 'swap',
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Metadata configuration
export const metadata: Metadata = {
  metadataBase: new URL('https://punks.24hrmvp.xyz'),
  title: {
    default: "The Cyphers | Encrypted Identities",
    template: "%s | The Cyphers"
  },
  description: "Join the elite network of Web3 builders. Encrypted identities, reputation tracking, and access to exclusive builder tools.",
  keywords: ["Web3", "Identity", "Builders", "Crypto", "DAO", "Reputation", "Cypherpunks"],
  authors: [{ name: "24HRMVP" }],
  creator: "24HRMVP",
  publisher: "24HRMVP",
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
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/icon.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://punks.24hrmvp.xyz",
    title: "The Cyphers | Encrypted Identities",
    description: "Join the elite network of Web3 builders. Encrypted identities, reputation tracking, and access to exclusive builder tools.",
    siteName: "The Cyphers",
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: "The Cyphers - Privacy is punk",
      },
      {
        url: '/og-square.png',
        width: 1080,
        height: 1080,
        alt: "The Cyphers - Square Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cyphers | Encrypted Identities",
    description: "Join the elite network of Web3 builders. Encrypted identities, reputation tracking, and access to exclusive builder tools.",
    images: ['/twitter-image.png'],
    creator: "@24HRMVP",
    site: "@24HRMVP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/Mona-Sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-50",
        orbitron.variable,
        spaceGrotesk.variable,
        inter.variable
      )}>
        <Providers>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
            <SiteHeader />
            <main className="flex-1 w-full relative z-10">
              {children}
            </main>
            <SiteFooter />
            
            {/* Ambient background effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
