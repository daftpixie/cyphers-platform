'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Terminal } from '@/components/ui/Terminal';
import { Button } from '@/components/ui/Button';
import { CypherCard } from '@/components/CypherCard';
import { useWallet } from '@/hooks/useWallet';
import { useMint, getStatusLabel, getStatusColor, isTerminalStatus } from '@/hooks/useMint';
import { api } from '@/lib/api';
import type { MintStats } from '@/types';

// QR Code component (simple SVG-based)
function QRCode({ value, size = 200 }: { value: string; size?: number }) {
  // In production, use a proper QR code library
  return (
    <div 
      className="bg-white p-4 rounded-lg inline-block"
      style={{ width: size, height: size }}
    >
      <div className="w-full h-full flex items-center justify-center text-void font-mono text-xs text-center break-all">
        {/* Placeholder - use qrcode.react or similar in production */}
        <span className="text-[8px]">{value}</span>
      </div>
    </div>
  );
}

export default function MintPage() {
  const { wallet, isConnected, connect, isConnecting, error: walletError } = useWallet();
  const { 
    session, 
    cypher, 
    isLoading, 
    error: mintError, 
    startMint, 
    confirmPayment, 
    cancelMint, 
    reset 
  } = useMint();
  
  const [stats, setStats] = useState<MintStats | null>(null);
  const [txHash, setTxHash] = useState('');
  const [step, setStep] = useState<'connect' | 'ready' | 'minting' | 'complete'>('connect');

  // Fetch stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.getMintStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    }
    fetchStats();
  }, []);

  // Update step based on state
  useEffect(() => {
    if (!isConnected) {
      setStep('connect');
    } else if (!session) {
      setStep('ready');
    } else if (session.status === 'CONFIRMED') {
      setStep('complete');
    } else {
      setStep('minting');
    }
  }, [isConnected, session]);

  const handleStartMint = async () => {
    try {
      await startMint();
    } catch (err) {
      console.error('Error starting mint:', err);
    }
  };

  const handleConfirmPayment = async () => {
    if (!txHash.trim()) return;
    try {
      await confirmPayment(txHash);
      setTxHash('');
    } catch (err) {
      console.error('Error confirming payment:', err);
    }
  };

  const handleReset = () => {
    reset();
    setTxHash('');
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-neon-cyan">Encrypt</span> Identity
          </h1>
          <p className="font-mono text-text-secondary">
            Mint your unique Cypherpunk identity on Dogecoin
          </p>
        </motion.div>

        {/* Stats Bar */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-4 mb-8 flex justify-center gap-8 font-mono text-sm"
          >
            <div>
              <span className="text-text-secondary">Minted:</span>{' '}
              <span className="text-neon-cyan">{stats.totalMinted}</span>
            </div>
            <div>
              <span className="text-text-secondary">Available:</span>{' '}
              <span className="text-neon-green">{stats.available}</span>
            </div>
            <div>
              <span className="text-text-secondary">Supply:</span>{' '}
              <span className="text-text-primary">{stats.maxSupply}</span>
            </div>
          </motion.div>
        )}

        {/* Main Terminal */}
        <Terminal title="mint_cypher.sh" className="mb-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Connect Wallet */}
            {step === 'connect' && (
              <motion.div
                key="connect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-neon-green">
                  &gt; Establishing secure connection...
                </p>
                <p className="text-text-secondary">
                  Connect your Dogecoin wallet to begin.
                </p>
                
                <div className="pt-4">
                  <Button 
                    variant="neon" 
                    onClick={connect}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </Button>
                </div>

                {walletError && (
                  <p className="text-red-500 text-sm mt-2">
                    Error: {walletError}
                  </p>
                )}
              </motion.div>
            )}

            {/* Step 2: Ready to Mint */}
            {step === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <p className="text-neon-green">
                  &gt; Connection established.
                </p>
                <p className="text-text-secondary">
                  Wallet: <span className="text-neon-cyan">{wallet?.address}</span>
                </p>
                <p className="text-text-secondary mt-4">
                  Your Cypher will be generated using AI and inscribed on Dogecoin.
                </p>
                <p className="text-text-secondary">
                  Rarity is determined by cryptographic randomness.
                </p>

                <div className="pt-4 flex gap-4">
                  <Button 
                    variant="chrome" 
                    onClick={handleStartMint}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Initializing...' : 'Start Encryption'}
                  </Button>
                </div>

                {mintError && (
                  <p className="text-red-500 text-sm mt-2">
                    Error: {mintError}
                  </p>
                )}
              </motion.div>
            )}

            {/* Step 3: Minting in Progress */}
            {step === 'minting' && session && (
              <motion.div
                key="minting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Status */}
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-neon-cyan animate-pulse" />
                  <p className={getStatusColor(session.status)}>
                    {getStatusLabel(session.status)}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-surface rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta"
                    initial={{ width: 0 }}
                    animate={{ width: `${session.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-text-muted text-sm">
                  Progress: {session.progress}%
                </p>

                {/* Payment Section */}
                {session.status === 'AWAITING_PAYMENT' && session.paymentAddress && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-6 bg-surface rounded-lg border border-border"
                  >
                    <p className="text-neon-orange font-bold mb-4">
                      Send DOGE to complete inscription:
                    </p>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                      <QRCode value={session.paymentAddress} />
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-text-muted text-sm">Address:</p>
                          <p className="font-mono text-sm break-all text-neon-cyan">
                            {session.paymentAddress}
                          </p>
                        </div>
                        <div>
                          <p className="text-text-muted text-sm">Amount:</p>
                          <p className="font-mono text-2xl text-gold">
                            Ð {session.paymentAmount?.toFixed(2) ?? '—'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* TX Hash Input */}
                    <div className="mt-6 space-y-3">
                      <input
                        type="text"
                        value={txHash}
                        onChange={(e) => setTxHash(e.target.value)}
                        placeholder="Enter transaction hash..."
                        className="input-terminal w-full"
                      />
                      <div className="flex gap-3">
                        <Button 
                          variant="neon" 
                          onClick={handleConfirmPayment}
                          disabled={!txHash.trim() || isLoading}
                        >
                          Confirm Payment
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={cancelMint}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Inscribing Status */}
                {session.status === 'INSCRIBING' && (
                  <div className="mt-6 text-center">
                    <p className="text-neon-magenta">
                      Inscribing your Cypher on Dogecoin...
                    </p>
                    <p className="text-text-muted text-sm mt-2">
                      This may take several minutes.
                    </p>
                  </div>
                )}

                {/* Token ID */}
                {session.tokenId && (
                  <p className="text-text-secondary">
                    Token ID: <span className="text-neon-cyan">#{session.tokenId}</span>
                  </p>
                )}

                {mintError && (
                  <p className="text-red-500 text-sm mt-2">
                    Error: {mintError}
                  </p>
                )}
              </motion.div>
            )}

            {/* Step 4: Complete */}
            {step === 'complete' && cypher && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <p className="text-neon-green text-xl">
                  &gt; Encryption complete.
                </p>
                <p className="text-text-secondary">
                  Your Cypher has been inscribed on Dogecoin forever.
                </p>

                <div className="py-6 flex justify-center">
                  <CypherCard cypher={cypher} />
                </div>

                {cypher.inscriptionId && (
                  <p className="text-text-muted text-sm text-center font-mono">
                    Inscription: {cypher.inscriptionId}
                  </p>
                )}

                <div className="flex justify-center gap-4">
                  <Button variant="neon" onClick={handleReset}>
                    Mint Another
                  </Button>
                  <Link href={`/gallery/${cypher.id}`}>
                    <Button variant="ghost">
                      View Details
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Terminal>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6"
        >
          <h3 className="font-heading text-lg font-bold mb-4 text-neon-cyan">
            How It Works
          </h3>
          <ol className="space-y-3 font-mono text-sm text-text-secondary">
            <li className="flex gap-3">
              <span className="text-neon-cyan">01.</span>
              <span>Connect your Dogecoin wallet</span>
            </li>
            <li className="flex gap-3">
              <span className="text-neon-cyan">02.</span>
              <span>AI generates your unique Cypherpunk identity</span>
            </li>
            <li className="flex gap-3">
              <span className="text-neon-cyan">03.</span>
              <span>Send DOGE to the payment address</span>
            </li>
            <li className="flex gap-3">
              <span className="text-neon-cyan">04.</span>
              <span>Your Cypher is inscribed on Dogecoin via Doginals</span>
            </li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
