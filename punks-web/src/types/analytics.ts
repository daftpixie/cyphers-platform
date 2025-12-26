/**
 * The Cyphers (punks.24hrmvp.xyz) - Analytics Event Types
 * 
 * Comprehensive type definitions for NFT platform tracking.
 * Used with Plausible Analytics self-hosted at analytics.24hrmvp.xyz
 */

// ============================================================================
// RARITY TYPES (mirror from types/index.ts)
// ============================================================================

export type RarityTier = 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';

// ============================================================================
// EVENT DEFINITIONS
// ============================================================================

/**
 * All trackable events on the Cyphers platform
 */
export type CyphersEvent =
  // ===== WALLET EVENTS =====
  | 'Wallet Connect Started'
  | 'Wallet Connected'
  | 'Wallet Connect Failed'
  | 'Wallet Disconnected'
  
  // ===== MINT FUNNEL EVENTS =====
  | 'Mint Page Viewed'
  | 'Mint Started'
  | 'Mint Generating'
  | 'Mint Awaiting Payment'
  | 'Mint Payment Submitted'
  | 'Mint Inscribing'
  | 'Mint Completed'
  | 'Mint Failed'
  | 'Mint Cancelled'
  
  // ===== GALLERY EVENTS =====
  | 'Gallery Viewed'
  | 'Gallery Filtered'
  | 'Gallery Sorted'
  | 'Gallery Search'
  | 'Cypher Card Viewed'
  | 'Cypher Detail Opened'
  
  // ===== PORTFOLIO EVENTS =====
  | 'Portfolio Viewed'
  | 'Portfolio Empty State'
  
  // ===== NAVIGATION EVENTS =====
  | 'Page Viewed'
  | 'Nav Link Clicked'
  | 'CTA Clicked'
  | 'External Link Clicked'
  | 'Social Link Clicked'
  
  // ===== ENGAGEMENT EVENTS =====
  | 'Scroll Depth'
  | 'Copy Address'
  | 'Copy Inscription ID'
  | 'Share Cypher';

// ============================================================================
// EVENT PROPERTIES
// ============================================================================

/**
 * Wallet event properties
 */
export interface WalletEventProps {
  /** Wallet provider used */
  provider?: 'dogelabs' | 'unisat' | 'manual' | string;
  /** Error message if failed */
  error?: string;
}

/**
 * Mint funnel event properties
 */
export interface MintEventProps {
  /** Session ID for funnel tracking */
  sessionId?: string;
  /** Token ID if assigned */
  tokenId?: number;
  /** Rarity tier if determined */
  rarity?: RarityTier;
  /** Payment amount in DOGE */
  paymentAmount?: number;
  /** Current progress percentage */
  progress?: number;
  /** Error message if failed */
  error?: string;
  /** Time spent in current stage (seconds) */
  duration?: number;
}

/**
 * Gallery interaction properties
 */
export interface GalleryEventProps {
  /** Filter applied */
  filter?: {
    rarity?: RarityTier;
    status?: 'inscribed' | 'pending';
  };
  /** Sort option */
  sortBy?: 'newest' | 'oldest' | 'tokenId' | 'rarity';
  /** Search query */
  searchQuery?: string;
  /** Number of results */
  resultCount?: number;
  /** Page number */
  page?: number;
}

/**
 * Cypher card/detail properties
 */
export interface CypherViewProps {
  /** Cypher ID */
  cypherId: string;
  /** Token ID */
  tokenId: number;
  /** Rarity tier */
  rarity: RarityTier;
  /** Whether inscribed on-chain */
  isInscribed: boolean;
  /** View context */
  context: 'gallery' | 'portfolio' | 'mint' | 'detail';
}

/**
 * Portfolio event properties
 */
export interface PortfolioEventProps {
  /** Number of owned Cyphers */
  ownedCount: number;
  /** Breakdown by rarity */
  rarityBreakdown?: {
    legendary: number;
    epic: number;
    rare: number;
    common: number;
  };
}

/**
 * Navigation event properties
 */
export interface NavEventProps {
  /** Target page/section */
  target: string;
  /** Source location */
  source: 'header' | 'footer' | 'page' | 'cta';
}

/**
 * CTA click properties
 */
export interface CTAClickProps {
  /** Button text or identifier */
  button: string;
  /** Location on page */
  location: 'header' | 'hero' | 'mint' | 'gallery' | 'portfolio' | 'footer';
  /** Destination if applicable */
  destination?: string;
}

/**
 * Social link click properties
 */
export interface SocialLinkProps {
  /** Platform name */
  platform: 'twitter' | 'farcaster' | 'discord' | 'github';
  /** Full URL */
  url: string;
}

/**
 * Scroll depth properties
 */
export interface ScrollDepthProps {
  /** Percentage milestone */
  depth: 25 | 50 | 75 | 100;
  /** Current page */
  page: string;
}

/**
 * Copy event properties
 */
export interface CopyEventProps {
  /** Type of content copied */
  type: 'address' | 'inscription_id' | 'tx_hash';
  /** Context where copied */
  context: 'mint' | 'detail' | 'portfolio';
}

/**
 * Share event properties
 */
export interface ShareEventProps {
  /** Cypher being shared */
  cypherId: string;
  /** Share method */
  method: 'twitter' | 'farcaster' | 'copy_link';
}

// ============================================================================
// EVENT PROPERTY MAPPING
// ============================================================================

/**
 * Maps event names to their property types for type safety
 */
export interface CyphersEventPropsMap {
  // Wallet events
  'Wallet Connect Started': WalletEventProps | undefined;
  'Wallet Connected': WalletEventProps;
  'Wallet Connect Failed': WalletEventProps;
  'Wallet Disconnected': undefined;
  
  // Mint funnel events
  'Mint Page Viewed': undefined;
  'Mint Started': MintEventProps;
  'Mint Generating': MintEventProps;
  'Mint Awaiting Payment': MintEventProps;
  'Mint Payment Submitted': MintEventProps;
  'Mint Inscribing': MintEventProps;
  'Mint Completed': MintEventProps;
  'Mint Failed': MintEventProps;
  'Mint Cancelled': MintEventProps;
  
  // Gallery events
  'Gallery Viewed': GalleryEventProps | undefined;
  'Gallery Filtered': GalleryEventProps;
  'Gallery Sorted': GalleryEventProps;
  'Gallery Search': GalleryEventProps;
  'Cypher Card Viewed': CypherViewProps;
  'Cypher Detail Opened': CypherViewProps;
  
  // Portfolio events
  'Portfolio Viewed': PortfolioEventProps;
  'Portfolio Empty State': undefined;
  
  // Navigation events
  'Page Viewed': { page: string };
  'Nav Link Clicked': NavEventProps;
  'CTA Clicked': CTAClickProps;
  'External Link Clicked': { url: string; text?: string };
  'Social Link Clicked': SocialLinkProps;
  
  // Engagement events
  'Scroll Depth': ScrollDepthProps;
  'Copy Address': CopyEventProps;
  'Copy Inscription ID': CopyEventProps;
  'Share Cypher': ShareEventProps;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Helper type for getting props for a specific event
 */
export type PropsForEvent<E extends CyphersEvent> = 
  E extends keyof CyphersEventPropsMap 
    ? CyphersEventPropsMap[E] 
    : Record<string, string | number | boolean>;

/**
 * Mint session status (mirrors backend)
 */
export type MintStatus = 
  | 'PENDING'
  | 'GENERATING'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_RECEIVED'
  | 'INSCRIBING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED';

/**
 * Maps mint status to analytics event
 */
export const MINT_STATUS_TO_EVENT: Record<MintStatus, CyphersEvent> = {
  PENDING: 'Mint Started',
  GENERATING: 'Mint Generating',
  AWAITING_PAYMENT: 'Mint Awaiting Payment',
  PAYMENT_RECEIVED: 'Mint Payment Submitted',
  INSCRIBING: 'Mint Inscribing',
  CONFIRMED: 'Mint Completed',
  FAILED: 'Mint Failed',
  CANCELLED: 'Mint Cancelled',
};
