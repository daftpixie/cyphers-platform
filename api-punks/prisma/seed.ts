// prisma/seed.ts
// Database seeding script for development and testing

import { PrismaClient, RarityTier, MintStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  // Initialize token counter
  const counter = await prisma.tokenCounter.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      lastTokenId: 0,
      maxSupply: 1000,
    },
  });
  console.log('✅ Token counter initialized:', counter);
  
  // Create system config entries
  const configs = [
    { key: 'MINT_PRICE', value: '100', description: 'Price in DOGE' },
    { key: 'MAX_SUPPLY', value: '1000', description: 'Maximum NFT supply' },
    { key: 'MINTING_ENABLED', value: 'true', description: 'Global minting toggle' },
  ];
  
  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }
  console.log('✅ System config entries created');
  
  // Create test users (development only)
  if (process.env.NODE_ENV !== 'production') {
    const testUsers = [
      { dogeAddress: 'D7Y3dJdFLEG5KvP3Kqd7CtxGbzfTmAqN8f', displayName: 'Test User 1' },
      { dogeAddress: 'DG2mPCnCPXzbwiqKpE1huE4bJUZF5Z8kcq', displayName: 'Test User 2' },
      { dogeAddress: 'DHNwq5qhKMBJwD1DKQKzXg6vv2s6RkYJJV', displayName: 'Test User 3' },
    ];
    
    for (const user of testUsers) {
      await prisma.user.upsert({
        where: { dogeAddress: user.dogeAddress },
        update: {},
        create: user,
      });
    }
    console.log('✅ Test users created');
    
    // Create sample confirmed Cyphers for gallery testing
    const sampleCyphers = [
      {
        tokenId: 1,
        rarityTier: RarityTier.LEGENDARY,
        rarityRole: 'Genesis Coder',
        maskType: 'Full Encryption Plate',
        materialType: 'Gold Chrome',
        encryptionType: 'PGP Block Scroll',
        glitchLevel: 'None',
        backgroundStyle: 'Binary Rain',
        accentColor: '#D4AF37',
        ownerAddress: 'D7Y3dJdFLEG5KvP3Kqd7CtxGbzfTmAqN8f',
        status: MintStatus.CONFIRMED,
        inscriptionId: 'dogi_sample_001',
        inscriptionTx: 'tx_sample_001',
        inscribedAt: new Date(),
        traitMetadata: {
          name: 'Genesis Prime',
          description: 'The first Cypher, keeper of the original manifesto.',
        },
      },
      {
        tokenId: 2,
        rarityTier: RarityTier.EPIC,
        rarityRole: 'Protocol Maintainer',
        maskType: 'Geometric Half-Mask',
        materialType: 'Silver Chrome',
        encryptionType: 'Hex Rain',
        glitchLevel: 'Low',
        backgroundStyle: 'Terminal Grid',
        accentColor: '#00D9FF',
        ownerAddress: 'DG2mPCnCPXzbwiqKpE1huE4bJUZF5Z8kcq',
        status: MintStatus.CONFIRMED,
        inscriptionId: 'dogi_sample_002',
        inscriptionTx: 'tx_sample_002',
        inscribedAt: new Date(),
        traitMetadata: {
          name: 'Protocol Guardian',
          description: 'A maintainer of the decentralized network.',
        },
      },
      {
        tokenId: 3,
        rarityTier: RarityTier.RARE,
        rarityRole: 'Node Runner',
        maskType: 'Tactical Goggles',
        materialType: 'Steel',
        encryptionType: 'Binary Matrix',
        glitchLevel: 'Medium',
        backgroundStyle: 'Network Nodes',
        accentColor: '#00FF00',
        ownerAddress: 'DHNwq5qhKMBJwD1DKQKzXg6vv2s6RkYJJV',
        status: MintStatus.CONFIRMED,
        inscriptionId: 'dogi_sample_003',
        inscriptionTx: 'tx_sample_003',
        inscribedAt: new Date(),
        traitMetadata: {
          name: 'Node Sentinel',
          description: 'Backbone of the network, running relays day and night.',
        },
      },
      {
        tokenId: 4,
        rarityTier: RarityTier.COMMON,
        rarityRole: 'Anon',
        maskType: 'Digital Blur',
        materialType: 'Classic Chrome',
        encryptionType: 'SHA-256 Hash Grid',
        glitchLevel: 'High',
        backgroundStyle: 'Void Black',
        accentColor: '#FF00FF',
        ownerAddress: 'D7Y3dJdFLEG5KvP3Kqd7CtxGbzfTmAqN8f',
        status: MintStatus.CONFIRMED,
        inscriptionId: 'dogi_sample_004',
        inscriptionTx: 'tx_sample_004',
        inscribedAt: new Date(),
        traitMetadata: {
          name: 'Shadow Agent',
          description: 'Anonymous presence in the digital underground.',
        },
      },
    ];
    
    for (const cypher of sampleCyphers) {
      const user = await prisma.user.findUnique({
        where: { dogeAddress: cypher.ownerAddress },
      });
      
      await prisma.cypherNFT.upsert({
        where: { tokenId: cypher.tokenId },
        update: {},
        create: {
          ...cypher,
          userId: user?.id,
        },
      });
    }
    
    // Update token counter to reflect seeded tokens
    await prisma.tokenCounter.update({
      where: { id: 'main' },
      data: { lastTokenId: 4 },
    });
    
    console.log('✅ Sample Cyphers created');
    
    // Create sample analytics entry
    await prisma.mintAnalytics.upsert({
      where: { date: new Date(new Date().toDateString()) },
      update: {},
      create: {
        date: new Date(new Date().toDateString()),
        totalMints: 4,
        successfulMints: 4,
        failedMints: 0,
        totalRevenue: 400,
        legendaryMints: 1,
        epicMints: 1,
        rareMints: 1,
        commonMints: 1,
      },
    });
    console.log('✅ Sample analytics created');
  }
  
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
