'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';
import { formatAddress } from '@/lib/utils';
import { Button } from './ui/Button';

export function WalletButton() {
  const {
    wallet,
    user,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error: connectionError,
  } = useWallet();

  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setError(null);
    try {
      await connect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  // Not connected - show connect button
  if (!isConnected) {
    return (
      <div className="relative">
        <Button
          variant="neon"
          size="md"
          onClick={handleConnect}
          loading={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Establish Connection'}
        </Button>
        
        <AnimatePresence>
          {(error || connectionError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-full mt-2 right-0 px-4 py-2 bg-neon-orange/20 border border-neon-orange/50 rounded-lg text-sm text-neon-orange whitespace-nowrap"
            >
              {error || connectionError}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Connected - show address dropdown
  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 px-4 py-2 bg-surface border border-border rounded-lg hover:border-neon-cyan transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Connection indicator */}
        <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        
        {/* Address */}
        <span className="font-mono text-sm text-text-primary">
          {formatAddress(wallet?.address || '')}
        </span>
        
        {/* Cyphers count */}
        {user && (
          <span className="px-2 py-0.5 bg-neon-cyan/20 text-neon-cyan text-xs rounded">
            {user.totalMinted} Cyphers
          </span>
        )}
        
        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>
      
      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 right-0 w-64 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b border-border">
                <p className="text-xs text-text-muted mb-1">Connected Address</p>
                <p className="font-mono text-sm text-text-primary break-all">{wallet?.address}</p>
              </div>
              
              {/* Menu Items */}
              <div className="p-2">
                <Link
                  href="/portfolio"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-void transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <svg className="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm text-text-primary">My Portfolio</span>
                </Link>
              </div>
              
              {/* External Links */}
              <div className="p-2 border-t border-border">
                <a
                  href="https://24hrmvp.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-void transition-colors"
                >
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-sm text-text-secondary">Main Platform →</span>
                </a>
              </div>
              
              {/* Disconnect */}
              <div className="p-2 border-t border-border">
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-neon-orange/10 transition-colors text-left"
                >
                  <svg className="w-4 h-4 text-neon-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm text-neon-orange">Disconnect</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WalletButton;
