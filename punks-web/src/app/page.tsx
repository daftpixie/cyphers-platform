'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Terminal from '@/components/ui/Terminal'
import Button from '@/components/ui/Button'
import { CypherCard } from '@/components/CypherCard'
import { api } from '@/lib/api'
import type { MintStats, CypherNFT } from '@/types'

export default function HomePage() {
  const [stats, setStats] = useState<MintStats | null>(null)
  const [featuredCyphers, setFeaturedCyphers] = useState<CypherNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, galleryRes] = await Promise.all([
          api.getMintStats(),
          api.getGallery({ limit: 4, sortBy: 'rarity' }),
        ])

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data)
        }

        if (galleryRes.success && galleryRes.data) {
          // Backend returns { cyphers: [...], pagination: ... } or { items: [...] }
          const data = galleryRes.data as { cyphers?: CypherNFT[]; items?: CypherNFT[] }
          setFeaturedCyphers(data.cyphers || data.items || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="relative">
      {/* Hero Section */}
      {/* Added pt-24 to prevent header overlap on mobile */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-24">
        {/* Animated grid background */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'center top',
            }}
          />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Title */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-6">
              <span className="text-chrome">THE</span>{' '}
              <span className="text-neon-cyan text-neon-glow">CYPHERS</span>
            </h1>

            {/* Subtitle */}
            <p className="font-mono text-lg md:text-xl text-text-secondary mb-4">
              1,000 On-Chain Identities on Dogecoin
            </p>
          </motion.div>

          {/* Manifesto quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <Terminal title="manifesto.txt" className="text-left">
              <p className="text-neon-green">&gt; "Privacy is necessary for an open society in the electronic age..."</p>
              <p className="text-neon-green mt-2">&gt; Cypherpunks write code."</p>
              <p className="text-text-muted mt-4 text-sm">— Eric Hughes, A Cypherpunk's Manifesto, 1993</p>
            </Terminal>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/mint">
              <Button variant="chrome" size="lg">
                Encrypt Identity
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="neon" size="lg">
                View Gallery
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <div className="glass-panel p-6 text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-neon-cyan mb-2">
                {stats?.totalMinted ?? '-'}
              </div>
              <div className="font-mono text-sm text-text-secondary uppercase tracking-wider">
                Encrypted
              </div>
            </div>
            <div className="glass-panel p-6 text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-neon-green mb-2">
                {stats?.available ?? '-'}
              </div>
              <div className="font-mono text-sm text-text-secondary uppercase tracking-wider">
                Available
              </div>
            </div>
            <div className="glass-panel p-6 text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-gold mb-2">
                {stats?.byRarity?.legendary?.minted ?? 0}/
                {stats?.byRarity?.legendary?.max ?? 10}
              </div>
              <div className="font-mono text-sm text-text-secondary uppercase tracking-wider">
                Legendary
              </div>
            </div>
            <div className="glass-panel p-6 text-center">
              <div className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-2">
                1000
              </div>
              <div className="font-mono text-sm text-text-secondary uppercase tracking-wider">
                Max Supply
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rarity Tiers Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Access <span className="text-neon-cyan">Levels</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                tier: 'Legendary',
                role: 'Genesis Coder',
                percent: 1,
                color: '#D4AF37',
                desc: 'The original architects who wrote the manifesto.',
              },
              {
                tier: 'Epic',
                role: 'Protocol Engineer',
                percent: 5,
                color: '#00D9FF',
                desc: 'Builders maintaining the decentralized infrastructure.',
              },
              {
                tier: 'Rare',
                role: 'Node Operator',
                percent: 15,
                color: '#00FF00',
                desc: 'The backbone of the network, running relays.',
              },
              {
                tier: 'Common',
                role: 'Anonymous User',
                percent: 79,
                color: '#A9A9A9',
                desc: 'The silent majority keeping privacy alive.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 hover:border-border-active transition-colors"
              >
                <div
                  className="font-display text-xl font-bold mb-1"
                  style={{ color: item.color }}
                >
                  {item.tier}
                </div>
                <div className="font-mono text-sm text-text-secondary mb-3">
                  {item.role} - {item.percent}%
                </div>
                <p className="text-text-secondary text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cyphers */}
      {featuredCyphers.length > 0 && (
        <section className="py-20 border-t border-border">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-center mb-12"
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold">
                Recent <span className="text-neon-cyan">Encryptions</span>
              </h2>
              <Link
                href="/gallery"
                className="text-neon-cyan hover:underline font-mono text-sm"
              >
                View All &rarr;
              </Link>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCyphers.map((cypher, i) => (
                <motion.div
                  key={cypher.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <CypherCard cypher={cypher} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Your Identity is <span className="text-neon-cyan">Data</span>
            </h2>
            <p className="font-mono text-text-secondary mb-8 max-w-xl mx-auto">
              Encrypt it. Own it. Forever on Dogecoin.
            </p>
            <Link href="/mint">
              <Button variant="chrome" size="lg">
                Encrypt Your Identity
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
