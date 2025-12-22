// src/services/claude.service.ts
// Claude AI service for generating Cypherpunk NFT artwork

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { RarityTier } from '@prisma/client';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: config.anthropic.apiKey,
});

// Rarity distribution weights
const RARITY_WEIGHTS = {
  LEGENDARY: 1,   // 1%
  EPIC: 5,        // 5%
  RARE: 15,       // 15%
  COMMON: 79,     // 79%
} as const;

// Rarity role mappings
const RARITY_ROLES: Record<RarityTier, string[]> = {
  LEGENDARY: ['Genesis Coder', 'Manifesto Signer', 'Root Key Holder'],
  EPIC: ['Protocol Maintainer', 'Infosec Specialist', 'Zero-Day Hunter'],
  RARE: ['Node Runner', 'Ghost Identity', 'Relay Operator'],
  COMMON: ['Power User', 'Anon', 'Privacy Advocate', 'Cipher Agent'],
};

// Material types by rarity
const MATERIALS: Record<RarityTier, string[]> = {
  LEGENDARY: ['Gold Chrome', 'Platinum', 'Holographic Gold'],
  EPIC: ['Silver Chrome', 'Gunmetal', 'Mercury'],
  RARE: ['Steel', 'Matte Black', 'Brushed Titanium'],
  COMMON: ['Chrome Black', 'Classic Chrome', 'Dark Aluminum'],
};

// Mask types by rarity
const MASK_TYPES: Record<RarityTier, string[]> = {
  LEGENDARY: ['Full Encryption Plate', 'Genesis Visor', 'Holographic Matrix'],
  EPIC: ['Geometric Half-Mask', 'Circuit-Board Skin', 'Neural Interface'],
  RARE: ['Tactical Goggles', 'Face Scarf', 'Data Visor'],
  COMMON: ['Digital Blur', 'Pixelation', 'Basic Visor'],
};

// Encryption overlay styles
const ENCRYPTION_TYPES = [
  'PGP Block Scroll', 'Hex Rain', 'Binary Matrix',
  'AES Cipher Text', 'RSA Key Fragments', 'SHA-256 Hash Grid',
];

// Glitch levels
const GLITCH_LEVELS = ['None', 'Low', 'Medium', 'High'];

// Background styles
const BACKGROUNDS = [
  'Binary Rain', 'Hex Code Scroll', 'Terminal Grid',
  'Circuit Board', 'Network Nodes', 'Void Black',
];

// Accent colors (neon)
const ACCENT_COLORS = [
  '#00D9FF', // Encryption Cyan
  '#FF00FF', // Relay Magenta
  '#00FF00', // Terminal Green
  '#0080FF', // Transport Blue
  '#FF5C00', // Warning Orange
];

export interface CypherTraits {
  rarityTier: RarityTier;
  rarityRole: string;
  maskType: string;
  materialType: string;
  encryptionType: string;
  glitchLevel: string;
  backgroundStyle: string;
  accentColor: string;
}

export interface GenerationResult {
  traits: CypherTraits;
  prompt: string;
  imageDescription: string;
  metadata: Record<string, unknown>;
}

/**
 * Determine rarity tier based on weighted random selection
 */
export function determineRarity(): RarityTier {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const [tier, weight] of Object.entries(RARITY_WEIGHTS)) {
    cumulative += weight;
    if (random < cumulative) {
      return tier as RarityTier;
    }
  }
  
  return 'COMMON';
}

/**
 * Pick a random element from an array
 */
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate random traits for a Cypher
 */
export function generateTraits(tokenId: number): CypherTraits {
  const rarityTier = determineRarity();
  
  return {
    rarityTier,
    rarityRole: randomFrom(RARITY_ROLES[rarityTier]),
    maskType: randomFrom(MASK_TYPES[rarityTier]),
    materialType: randomFrom(MATERIALS[rarityTier]),
    encryptionType: randomFrom(ENCRYPTION_TYPES),
    glitchLevel: randomFrom(GLITCH_LEVELS),
    backgroundStyle: randomFrom(BACKGROUNDS),
    accentColor: randomFrom(ACCENT_COLORS),
  };
}

/**
 * Build the AI prompt for generating a Cypher image
 */
function buildPrompt(traits: CypherTraits, tokenId: number): string {
  return `Create a highly detailed digital portrait of a Cypherpunk identity avatar.

CORE CONCEPT:
This is Cypher #${tokenId}, a "${traits.rarityRole}" - part of an elite collection of 1,000 encrypted digital identities.

VISUAL REQUIREMENTS:
- Subject: A mysterious figure wearing a ${traits.maskType} made of ${traits.materialType}
- The mask/face covering should have a liquid chrome, highly reflective finish
- Material: ${traits.materialType} - show realistic metallic reflections and depth
- Background: ${traits.backgroundStyle} with ${traits.accentColor} neon accents
- Overlay: ${traits.encryptionType} - subtle cryptographic text/symbols floating in front
- Glitch Effect: ${traits.glitchLevel} - RGB chromatic aberration and scan lines
- Accent Color: ${traits.accentColor} - used for eye glow, data streams, and highlights

STYLE DIRECTION:
- Dark, moody cyberpunk aesthetic inspired by the 1993 Cypherpunk Manifesto
- High contrast with deep shadows
- The figure embodies digital privacy and cryptographic sovereignty
- Professional concept art quality, suitable for NFT collection
- Portrait orientation, centered composition
- Ultra-detailed, photorealistic rendering of metallic surfaces

ATMOSPHERE:
"Privacy is necessary for an open society in the electronic age."
The image should evoke themes of anonymity, resistance, and technological empowerment.

OUTPUT: A single character portrait, no background characters, no text overlays.`;
}

/**
 * Generate a Cypher using Claude AI
 */
export async function generateCypher(tokenId: number): Promise<GenerationResult> {
  const traits = generateTraits(tokenId);
  const prompt = buildPrompt(traits, tokenId);
  
  logger.info('Generating Cypher', { tokenId, rarityTier: traits.rarityTier, role: traits.rarityRole });
  
  try {
    // Use Claude to generate a detailed description that can be used with an image AI
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `You are an expert concept artist creating a unique Cypherpunk NFT character.

Based on the following requirements, create a detailed visual description that could be used to generate AI art:

${prompt}

Provide:
1. A detailed paragraph describing the exact visual appearance (200-300 words)
2. A shorter "artist prompt" optimized for image generation AI (50-100 words)
3. A unique name/title for this specific Cypher
4. A brief lore snippet about this character (2-3 sentences)

Format your response as JSON with keys: description, artistPrompt, name, lore`,
        },
      ],
    });
    
    // Extract text content
    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude');
    }
    
    // Parse the JSON response
    let parsed: {
      description: string;
      artistPrompt: string;
      name: string;
      lore: string;
    };
    
    try {
      // Try to extract JSON from the response
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback if JSON parsing fails
      parsed = {
        description: textBlock.text,
        artistPrompt: prompt,
        name: `Cypher #${tokenId}`,
        lore: `A ${traits.rarityRole} of the Cypherpunk resistance.`,
      };
    }
    
    logger.info('Cypher generated successfully', { 
      tokenId, 
      name: parsed.name,
      rarityTier: traits.rarityTier 
    });
    
    return {
      traits,
      prompt: parsed.artistPrompt || prompt,
      imageDescription: parsed.description,
      metadata: {
        name: parsed.name,
        description: parsed.lore,
        tokenId,
        attributes: [
          { trait_type: 'Rarity Tier', value: traits.rarityTier },
          { trait_type: 'Role', value: traits.rarityRole },
          { trait_type: 'Mask Type', value: traits.maskType },
          { trait_type: 'Material', value: traits.materialType },
          { trait_type: 'Encryption', value: traits.encryptionType },
          { trait_type: 'Glitch Level', value: traits.glitchLevel },
          { trait_type: 'Background', value: traits.backgroundStyle },
          { trait_type: 'Accent Color', value: traits.accentColor },
        ],
        generatedBy: 'claude-sonnet-4-5',
        collection: 'The Cyphers',
        totalSupply: 1000,
      },
    };
  } catch (error) {
    logger.error('Cypher generation failed', { tokenId, error });
    throw error;
  }
}

/**
 * Generate multiple Cyphers in batch (for pre-generation)
 */
export async function generateBatch(
  startTokenId: number, 
  count: number,
  onProgress?: (completed: number, total: number) => void
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const tokenId = startTokenId + i;
    
    try {
      const result = await generateCypher(tokenId);
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, count);
      }
      
      // Rate limit: wait between generations
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.error(`Failed to generate Cypher #${tokenId}`, { error });
      // Continue with next token
    }
  }
  
  return results;
}
