'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { formatAddress, getIpfsUrl, getRarityBadgeClass } from '@/lib/utils';
import type { CypherNFT } from '@/types';
import { RARITY_CONFIG } from '@/types';

interface CypherCardProps {
  cypher: CypherNFT;
  className?: string;
  showOwner?: boolean;
  onClick?: () => void;
}

export function CypherCard({
  cypher,
  className,
  showOwner = true,
  onClick,
}: CypherCardProps) {
  const {
    id,
    tokenId,
    name,
    rarityTier,
    rarityRole,
    ownerAddress,
    ipfsHash,
    imageUrl,
    inscriptionId,
    maskType,
    maskMaterial,
    encryptionType,
    glitchLevel,
  } = cypher;
  
  const rarityConfig = RARITY_CONFIG[rarityTier] || RARITY_CONFIG.COMMON;
  
  // Build traits object for display
  const traits = {
    mask: maskType,
    material: maskMaterial,
    encryption: encryptionType,
    glitch: glitchLevel,
  };
  
  const cardContent = (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className={cn('cypher-card group cursor-pointer', className)}
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {/* Scan lines overlay */}
        <div className="absolute inset-0 scan-lines z-10 opacity-30" />
        
        {/* Rarity glow effect */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(circle at center, ${rarityConfig.color}20 0%, transparent 70%)`,
          }}
        />
        
        {/* NFT Image */}
        {(imageUrl || ipfsHash) ? (
          <Image
            src={imageUrl || getIpfsUrl(ipfsHash)}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface text-text-muted font-mono text-sm">
            Generating...
          </div>
        )}
        
        {/* Token ID Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="px-2 py-1 bg-void/80 backdrop-blur-sm rounded text-xs font-mono text-text-secondary">
            #{tokenId.toString().padStart(4, '0')}
          </span>
        </div>
        
        {/* Inscribed Badge */}
        {inscriptionId && (
          <div className="absolute top-3 right-3 z-20">
            <span className="px-2 py-1 bg-neon-green/20 backdrop-blur-sm rounded text-xs font-mono text-neon-green border border-neon-green/30">
              INSCRIBED
            </span>
          </div>
        )}
      </div>
      
      {/* Info Section */}
      <div className="p-4 space-y-3">
        {/* Name and Rarity */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold text-text-primary truncate flex-1">
            {name}
          </h3>
          <span className={getRarityBadgeClass(rarityTier)}>
            {rarityConfig.label}
          </span>
        </div>
        
        {/* Role */}
        <p 
          className="text-sm font-mono"
          style={{ color: rarityConfig.color }}
        >
          {rarityRole}
        </p>
        
        {/* Traits Preview */}
        <div className="flex flex-wrap gap-1">
          {Object.entries(traits).filter(([_, v]) => v).slice(0, 3).map(([key, value]) => (
            <span 
              key={key}
              className="px-2 py-0.5 bg-surface rounded text-xs text-text-muted"
            >
              {value}
            </span>
          ))}
        </div>
        
        {/* Owner */}
        {showOwner && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-text-muted">
              Owner: <span className="font-mono text-text-secondary">{formatAddress(ownerAddress)}</span>
            </p>
          </div>
        )}
      </div>
      
      {/* Hover Glitch Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
        <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/5 to-transparent" />
      </div>
    </motion.div>
  );

  return cardContent;
}

// Skeleton loading state
export function CypherCardSkeleton() {
  return (
    <div className="cypher-card animate-pulse">
      <div className="aspect-square bg-surface" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="h-5 bg-surface rounded w-32" />
          <div className="h-5 bg-surface rounded w-16" />
        </div>
        <div className="h-4 bg-surface rounded w-24" />
        <div className="flex gap-1">
          <div className="h-5 bg-surface rounded w-16" />
          <div className="h-5 bg-surface rounded w-20" />
        </div>
        <div className="pt-2 border-t border-border/50">
          <div className="h-3 bg-surface rounded w-40" />
        </div>
      </div>
    </div>
  );
}
