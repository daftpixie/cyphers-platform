'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CypherCard } from '@/components/CypherCard'
import Button from '@/components/ui/Button'
import Terminal from '@/components/ui/Terminal'
import { useWallet } from '@/hooks/useWallet'
import { api } from '@/lib/api'
import type { CypherNFT, User } from '@/types'
import { RARITY_CONFIG } from '@/types'

export default function PortfolioPage() {
  const { wallet, user, isConnected, connect, isConnecting, error: walletError } = useWallet()
  const [cyphers, setCyphers] = useState<CypherNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user's cyphers
  useEffect(() => {
    async function fetchPortfolio() {
      if (!wallet?.address) return
      
      setIsLoading(true)
      try {
        const response = await api.getPortfolio(wallet.address)
        if (response.success && response.data) {
          // Backend returns { cyphers: [...], pagination: ... } or { items: [...] }
          const data = response.data as { cyphers?: CypherNFT[]; items?: CypherNFT[] }
          setCyphers(data.cyphers || data.items || [])
        } else {
          setCyphers([])
        }
      } catch (err) {
        console.error('Error fetching portfolio:', err)
        setCyphers([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isConnected && wallet?.address) {
      fetchPortfolio()
    }
  }, [isConnected, wallet?.address])

  // Calculate stats
  const stats = {
    total: cyphers.length,
    legendary: cyphers.filter(c => c.rarityTier === 'LEGENDARY').length,
    epic: cyphers.filter(c => c.rarityTier === 'EPIC').length,
    rare: cyphers.filter(c => c.rarityTier === 'RARE').length,
    common: cyphers.filter(c => c.rarityTier === 'COMMON').length,
  }

  return (
    // CHANGED: Increased top padding from py-20 to pt-32 pb-20
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            <span className="text-neon-cyan">Portfolio</span>
          </h1>
          <p className="font-mono text-text-secondary">
            Your encrypted identities
          </p>
        </motion.div>

        {/* Not Connected State */}
        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto"
          >
            <Terminal title="identity_check.sh">
              <p className="text-neon-green mb-4">&gt; Waiting for identity verification...</p>
              <p className="text-text-secondary mb-6">
                Connect your Dogecoin wallet to view your Cyphers.
              </p>
              
              <Button 
                variant="neon" 
                onClick={connect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Establishing Connection...' : 'ESTABLISH CONNECTION'}
              </Button>

              {walletError && (
                <p className="text-red-500 text-sm mt-4">Error: {walletError}</p>
              )}
            </Terminal>
          </motion.div>
        ) : (
          <>
            {/* Wallet Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="font-mono text-sm text-text-muted mb-1">Connected Wallet</p>
                  <p className="font-mono text-neon-cyan break-all">{wallet?.address}</p>
                </div>
                
                <div className="flex gap-4 font-mono text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
                    <p className="text-text-muted">Total</p>
                  </div>
                  {stats.legendary > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gold">{stats.legendary}</p>
                      <p className="text-text-muted">Legendary</p>
                    </div>
                  )}
                  {stats.epic > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neon-cyan">{stats.epic}</p>
                      <p className="text-text-muted">Epic</p>
                    </div>
                  )}
                  {stats.rare > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neon-green">{stats.rare}</p>
                      <p className="text-text-muted">Rare</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Loading State */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-surface animate-pulse" />
                ))}
              </div>
            ) : cyphers.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <Terminal title="status.log">
                    <p className="text-neon-orange mb-4">&gt; No identities found.</p>
                    <p className="text-text-secondary">
                      You haven&apos;t encrypted any Cyphers yet.
                    </p>
                  </Terminal>
                  
                  <div className="mt-8">
                    <Link href="/mint">
                      <Button variant="chrome">Encrypt Your First Identity</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Cyphers Grid */
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {cyphers.map((cypher, i) => (
                    <motion.div
                      key={cypher.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CypherCard cypher={cypher} />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Mint More CTA */}
                {cyphers.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mt-12"
                  >
                    <Link href="/mint">
                      <Button variant="neon">Encrypt Another Identity</Button>
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}

        {/* Collection Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            Cypher <span className="text-neon-cyan">Benefits</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-6">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="font-heading text-lg font-bold mb-2">On-Chain Identity</h3>
              <p className="text-text-secondary text-sm">
                Your Cypher is inscribed permanently on Dogecoin. True ownership, no centralized server.
              </p>
            </div>
            <div className="glass-panel p-6">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="font-heading text-lg font-bold mb-2">Governance Rights</h3>
              <p className="text-text-secondary text-sm">
                Cypher holders can vote on 24HRMVP platform decisions. Your identity, your voice.
              </p>
            </div>
            <div className="glass-panel p-6">
              <div className="text-3xl mb-4">🎨</div>
              <h3 className="font-heading text-lg font-bold mb-2">Unique AI Art</h3>
              <p className="text-text-secondary text-sm">
                Each Cypher is generated by AI with unique traits. No two are alike.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
