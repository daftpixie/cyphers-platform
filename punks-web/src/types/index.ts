// ============================================
// CYPHERS PLATFORM TYPE DEFINITIONS
// ============================================

export type RarityTier = 'LEGENDARY' | 'EPIC' | 'RARE' | 'COMMON';

export type MintStatus = 
  | 'PENDING'
  | 'GENERATING'
  | 'AWAITING_PAYMENT'
  | 'INSCRIBING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED';

// User types
export interface User {
  id: string;
  dogeAddress: string;
  username?: string;
  totalMinted: number;
  createdAt: string;
  updatedAt: string;
}

// Cypher NFT types
export interface CypherNFT {
  id: string;
  tokenId: number;
  name: string;
  description: string;
  rarityTier: RarityTier;
  rarityRole: string;
  
  // Visual traits
  maskType: string;
  maskMaterial: string;
  encryptionType: string;
  dataStream: string;
  background: string;
  glitchLevel: string;
  accessory?: string;
  
  // Storage
  ipfsHash?: string;
  imageUrl?: string;
  inscriptionId?: string;
  inscriptionTx?: string;
  
  // Status
  status: MintStatus;
  ownerAddress: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Mint session types
export interface MintSession {
  id: string;
  userId: string;
  status: MintStatus;
  tokenId?: number;
  rarityTier?: RarityTier;
  
  // Payment
  paymentAddress?: string;
  paymentAmount?: number;
  paymentTxHash?: string;
  
  // Progress
  progress: number;
  currentStep?: string;
  
  // Result
  cypherId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface AuthChallenge {
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface AuthVerifyRequest {
  address: string;
  signature: string;
  nonce: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

// Minting stats
export interface MintStats {
  totalMinted: number;
  available: number;
  maxSupply: number;
  byRarity: {
    legendary: { minted: number; max: number };
    epic: { minted: number; max: number };
    rare: { minted: number; max: number };
    common: { minted: number; max: number };
  };
}

// Wallet types
export interface DogeWallet {
  address: string;
  publicKey?: string;
  connected: boolean;
  provider?: 'dogelabs' | 'unisat' | 'manual';
}

// Gallery filter types
export interface GalleryFilters {
  rarity?: RarityTier;
  status?: 'inscribed' | 'pending';
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'tokenId' | 'rarity';
}

// Component prop types
export interface CypherCardProps {
  cypher: CypherNFT;
  showOwner?: boolean;
  onClick?: () => void;
}

export interface TerminalProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'chrome' | 'neon' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// Rarity configuration
export const RARITY_CONFIG: Record<RarityTier, {
  label: string;
  role: string;
  color: string;
  percentage: number;
  maxSupply: number;
}> = {
  LEGENDARY: {
    label: 'Legendary',
    role: 'Genesis Coder',
    color: '#D4AF37',
    percentage: 1,
    maxSupply: 10,
  },
  EPIC: {
    label: 'Epic',
    role: 'Protocol Engineer',
    color: '#00D9FF',
    percentage: 5,
    maxSupply: 50,
  },
  RARE: {
    label: 'Rare',
    role: 'Node Operator',
    color: '#00FF00',
    percentage: 15,
    maxSupply: 150,
  },
  COMMON: {
    label: 'Common',
    role: 'Anonymous User',
    color: '#A9A9A9',
    percentage: 79,
    maxSupply: 790,
  },
};
