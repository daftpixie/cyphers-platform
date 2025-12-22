/**
 * Utility Functions and Constants
 * The Cyphers Platform
 */

// Rarity configuration
export const RARITY_CONFIG = {
  LEGENDARY: {
    label: 'Genesis Coder',
    color: '#D4AF37',
    bgColor: 'rgba(212, 175, 55, 0.15)',
    percentage: '1%',
    description: 'The architects who wrote the original manifesto',
  },
  EPIC: {
    label: 'Protocol Engineer',
    color: '#00D9FF',
    bgColor: 'rgba(0, 217, 255, 0.15)',
    percentage: '5%',
    description: 'The builders maintaining the decentralized infrastructure',
  },
  RARE: {
    label: 'Node Operator',
    color: '#00FF00',
    bgColor: 'rgba(0, 255, 0, 0.15)',
    percentage: '15%',
    description: 'The backbone of the network, running relays and nodes',
  },
  COMMON: {
    label: 'Anonymous User',
    color: '#A9A9A9',
    bgColor: 'rgba(169, 169, 169, 0.15)',
    percentage: '79%',
    description: 'The silent majority who value privacy',
  },
};

// Format Dogecoin address for display
export function formatAddress(address: string | null, chars: number = 6): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format time remaining
export function formatTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get rarity badge class
export function getRarityBadgeClass(rarity: string): string {
  const rarityMap: Record<string, string> = {
    LEGENDARY: 'badge-legendary',
    EPIC: 'badge-epic',
    RARE: 'badge-rare',
    COMMON: 'badge-common',
  };
  return rarityMap[rarity.toUpperCase()] || 'badge-common';
}

// Get status color
export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: '#A9A9A9',
    GENERATING: '#00D9FF',
    AWAITING_PAYMENT: '#FF00FF',
    INSCRIBING: '#0080FF',
    CONFIRMED: '#00FF00',
    FAILED: '#FF5C00',
    CANCELLED: '#A9A9A9',
  };
  return statusMap[status.toUpperCase()] || '#A9A9A9';
}

// Generate IPFS gateway URL
export function getIpfsUrl(hash: string | undefined): string {
  if (!hash) return '/placeholder-cypher.png';
  
  // Use multiple gateways for redundancy
  const gateways = [
    `https://gateway.pinata.cloud/ipfs/${hash}`,
    `https://ipfs.io/ipfs/${hash}`,
    `https://cloudflare-ipfs.com/ipfs/${hash}`,
  ];
  
  return gateways[0]; // Primary gateway
}

// Sleep utility
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

// Validate Dogecoin address
export function isValidDogeAddress(address: string): boolean {
  // Basic validation - Doge addresses start with D or 9 (testnet)
  const regex = /^[D9n][1-9A-HJ-NP-Za-km-z]{25,34}$/;
  return regex.test(address);
}

// Generate random hex string (for demo purposes)
export function randomHex(length: number = 8): string {
  let result = '';
  const chars = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Terminal typing animation strings
export const TERMINAL_STRINGS = {
  connecting: [
    'Initializing secure connection...',
    'Establishing encrypted tunnel...',
    'Verifying node identity...',
    'Connection established.',
  ],
  generating: [
    'Accessing neural network...',
    'Generating cryptographic identity...',
    'Encoding visual signature...',
    'Applying encryption layers...',
    'Finalizing identity matrix...',
  ],
  inscribing: [
    'Preparing inscription payload...',
    'Broadcasting to Dogecoin network...',
    'Awaiting block confirmation...',
    'Verifying inscription...',
    'Identity permanently inscribed.',
  ],
};

// Chain configuration
export const CHAIN_CONFIG = {
  name: 'Dogecoin',
  symbol: 'DOGE',
  decimals: 8,
  explorerUrl: 'https://dogechain.info',
  explorerTxUrl: (txHash: string) => `https://dogechain.info/tx/${txHash}`,
  explorerAddressUrl: (address: string) => `https://dogechain.info/address/${address}`,
};

// Links
export const LINKS = {
  mainPlatform: 'https://24hrmvp.xyz',
  twitter: 'https://twitter.com/24hrmvp',
  farcaster: 'https://warpcast.com/24hrmvp',
  docs: 'https://docs.24hrmvp.xyz',
  manifesto: '/manifesto',
};

// Trait categories for display
export const TRAIT_CATEGORIES = {
  maskType: 'Encryption Mask',
  material: 'Material',
  encryptionType: 'Data Stream',
  glitchLevel: 'Glitch Intensity',
  background: 'Environment',
  accessory: 'Protocol Module',
};
