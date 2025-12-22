'use client';

import Link from 'next/link';
import { LINKS } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="relative mt-20 border-t border-border/50">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-neon-cyan)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-neon-cyan)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-void border border-neon-cyan flex items-center justify-center">
                <span className="text-neon-cyan font-display font-black text-sm">C</span>
              </div>
              <span className="font-display font-black text-xl text-chrome">
                THE CYPHERS
              </span>
            </div>
            
            <p className="text-text-secondary text-sm leading-relaxed max-w-md mb-6">
              1,000 AI-generated digital identities inscribed permanently on the Dogecoin blockchain. 
              Privacy is punk. Own your identity.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href={LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface border border-border hover:border-neon-cyan transition-colors group"
              >
                <svg className="w-5 h-5 text-text-muted group-hover:text-neon-cyan transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={LINKS.farcaster}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-surface border border-border hover:border-neon-magenta transition-colors group"
              >
                <svg className="w-5 h-5 text-text-muted group-hover:text-neon-magenta transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.24 2.25H5.76c-1.94 0-3.51 1.57-3.51 3.51v12.48c0 1.94 1.57 3.51 3.51 3.51h12.48c1.94 0 3.51-1.57 3.51-3.51V5.76c0-1.94-1.57-3.51-3.51-3.51zm-.75 14.25c0 .41-.34.75-.75.75H7.26c-.41 0-.75-.34-.75-.75V7.5c0-.41.34-.75.75-.75h9.48c.41 0 .75.34.75.75z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Links Column */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-primary mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/mint" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">
                  Encrypt Identity
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/manifesto" className="text-sm text-text-secondary hover:text-neon-cyan transition-colors">
                  Manifesto
                </Link>
              </li>
              <li>
                <a
                  href={LINKS.mainPlatform}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-neon-cyan transition-colors inline-flex items-center gap-1"
                >
                  24HRMVP
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Resources Column */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-primary mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={LINKS.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-neon-cyan transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://dogechain.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-neon-cyan transition-colors inline-flex items-center gap-1"
                >
                  Dogechain Explorer
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://doginals.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-text-secondary hover:text-neon-cyan transition-colors inline-flex items-center gap-1"
                >
                  Doginals Protocol
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted text-center sm:text-left">
            © 2025 The Cyphers. All rights reserved. Built on Dogecoin.
          </p>
          
          <p className="text-xs text-text-muted font-mono">
            "Cypherpunks write code." — Eric Hughes, 1993
          </p>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
