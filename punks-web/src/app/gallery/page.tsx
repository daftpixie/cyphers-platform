'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CypherCard } from '@/components/CypherCard'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import type { CypherNFT, RarityTier, GalleryFilters } from '@/types'
import { RARITY_CONFIG } from '@/types'

const ITEMS_PER_PAGE = 12

export default function GalleryPage() {
  const [cyphers, setCyphers] = useState<CypherNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<GalleryFilters>({ sortBy: 'newest' })
  const [selectedCypher, setSelectedCypher] = useState<CypherNFT | null>(null)

  // Fetch cyphers
  const fetchCyphers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.getGallery({
        page,
        limit: ITEMS_PER_PAGE,
        ...filters,
      })

      if (response.success && response.data) {
        // Backend returns { cyphers: [...], pagination: ... } or { items: [...] }
        const data = response.data as { cyphers?: CypherNFT[]; items?: CypherNFT[]; pagination?: { total: number }; total?: number }
        setCyphers(data.cyphers || data.items || [])
        setTotal(data.pagination?.total || data.total || 0)
      } else {
        setCyphers([])
        setTotal(0)
      }
    } catch (err) {
      console.error('Error fetching gallery:', err)
      setCyphers([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [page, filters])

  useEffect(() => {
    fetchCyphers()
  }, [fetchCyphers])

  // Handle filter changes
  const handleRarityFilter = (rarity: RarityTier | undefined) => {
    setFilters(prev => ({ ...prev, rarity }))
    setPage(1)
  }

  const handleSortChange = (sortBy: GalleryFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy }))
    setPage(1)
  }

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

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
            <span className="text-neon-cyan">Gallery</span>
          </h1>
          <p className="font-mono text-text-secondary">
            {total} Cyphers Inscribed on Dogecoin
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-4 mb-8"
        >
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Rarity Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleRarityFilter(undefined)}
                className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                  !filters.rarity
                    ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan'
                    : 'bg-surface text-text-secondary border border-border hover:border-text-secondary'
                }`}
              >
                All
              </button>
              {(Object.keys(RARITY_CONFIG) as RarityTier[]).map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => handleRarityFilter(rarity)}
                  className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${
                    filters.rarity === rarity
                      ? 'border'
                      : 'bg-surface text-text-secondary border border-border hover:border-text-secondary'
                  }`}
                  style={{
                    borderColor: filters.rarity === rarity ? RARITY_CONFIG[rarity].color : undefined,
                    color: filters.rarity === rarity ? RARITY_CONFIG[rarity].color : undefined,
                    backgroundColor: filters.rarity === rarity ? `${RARITY_CONFIG[rarity].color}20` : undefined,
                  }}
                >
                  {RARITY_CONFIG[rarity].label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => handleSortChange(e.target.value as GalleryFilters['sortBy'])}
                className="input-terminal px-4 py-2 text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="tokenId">Token ID</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : cyphers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-text-secondary font-mono text-lg mb-4">No Cyphers found.</p>
            <p className="text-text-muted">Try adjusting your filters or be the first to mint!</p>
          </motion.div>
        ) : (
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" layout>
            <AnimatePresence mode="popLayout">
              {cyphers.map((cypher, i) => (
                <motion.div
                  key={cypher.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <CypherCard cypher={cypher} onClick={() => setSelectedCypher(cypher)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center gap-2 mt-12"
          >
            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2 px-4">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-mono text-sm transition-all ${
                      page === pageNum
                        ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan'
                        : 'bg-surface text-text-secondary border border-border hover:border-text-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </motion.div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedCypher && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm"
              onClick={() => setSelectedCypher(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-panel p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-chrome">{selectedCypher.name}</h2>
                    <p className="font-mono text-text-secondary">{selectedCypher.tokenId}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCypher(null)}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="aspect-square bg-surface rounded-lg overflow-hidden">
                    {selectedCypher.imageUrl ? (
                      <img
                        src={selectedCypher.imageUrl}
                        alt={selectedCypher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted font-mono">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div className={`badge-${selectedCypher.rarityTier.toLowerCase()} inline-block`}>
                      {selectedCypher.rarityTier}
                    </div>
                    
                    <p className="text-text-secondary text-sm">{selectedCypher.description}</p>

                    <div className="space-y-2">
                      <h3 className="font-mono text-sm text-text-muted uppercase tracking-wider">Signature Attributes</h3>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        <div className="bg-surface p-2 rounded">
                          <span className="text-text-muted">Mask: </span>
                          <span className="text-neon-cyan">{selectedCypher.maskType}</span>
                        </div>
                        <div className="bg-surface p-2 rounded">
                          <span className="text-text-muted">Material: </span>
                          <span className="text-neon-cyan">{selectedCypher.maskMaterial}</span>
                        </div>
                        <div className="bg-surface p-2 rounded">
                          <span className="text-text-muted">Encryption: </span>
                          <span className="text-neon-cyan">{selectedCypher.encryptionType}</span>
                        </div>
                        <div className="bg-surface p-2 rounded">
                          <span className="text-text-muted">Glitch: </span>
                          <span className="text-neon-cyan">{selectedCypher.glitchLevel}</span>
                        </div>
                      </div>
                    </div>

                    {selectedCypher.inscriptionId && (
                      <div className="pt-4 border-t border-border">
                        <p className="font-mono text-xs text-text-muted mb-1">Inscription ID</p>
                        <p className="font-mono text-sm text-neon-green break-all">
                          {selectedCypher.inscriptionId}
                        </p>
                      </div>
                    )}

                    {selectedCypher.ownerAddress && (
                      <div className="pt-4">
                        <p className="font-mono text-xs text-text-muted mb-1">Owner</p>
                        <p className="font-mono text-sm text-text-secondary break-all">
                          {selectedCypher.ownerAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
