'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { WalletButton } from './WalletButton';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/mint', label: 'Encrypt Identity' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/portfolio', label: 'Portfolio' },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-void/80 backdrop-blur-xl border-b border-border/50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              {/* Animated glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-cyan to-neon-magenta opacity-50 blur-sm group-hover:opacity-100 transition-opacity" />
              <div className="relative w-8 h-8 rounded-full bg-void border border-neon-cyan flex items-center justify-center">
                <span className="text-neon-cyan font-display font-black text-xs">C</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-black text-xl text-chrome">
                THE CYPHERS
              </span>
              <span className="ml-2 text-xs text-text-muted font-mono">
                v1.0
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2 font-heading text-sm font-medium uppercase tracking-wider transition-colors',
                    isActive
                      ? 'text-neon-cyan'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-neon-cyan"
                      style={{ boxShadow: '0 0 10px var(--color-neon-cyan)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* External Link to Main Platform */}
            <a
              href="https://24hrmvp.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-text-muted hover:text-neon-cyan transition-colors border border-border/50 rounded-lg hover:border-neon-cyan/50"
            >
              <span className="font-mono">24HRMVP</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            
            {/* Wallet Button */}
            <WalletButton />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden relative bg-surface border-t border-border"
          >
            <nav className="px-4 py-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-lg font-heading text-sm font-medium uppercase tracking-wider transition-colors',
                      isActive
                        ? 'bg-neon-cyan/10 text-neon-cyan'
                        : 'text-text-secondary hover:bg-void hover:text-text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              
              {/* Mobile External Link */}
              <a
                href="https://24hrmvp.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-lg text-text-muted hover:bg-void transition-colors"
              >
                <span className="font-heading text-sm uppercase tracking-wider">Main Platform</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
export default Header;
