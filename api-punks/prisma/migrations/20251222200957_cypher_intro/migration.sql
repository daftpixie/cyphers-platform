-- CreateEnum
CREATE TYPE "RarityTier" AS ENUM ('LEGENDARY', 'EPIC', 'RARE', 'COMMON');

-- CreateEnum
CREATE TYPE "MintStatus" AS ENUM ('PENDING', 'GENERATING', 'GENERATION_FAILED', 'AWAITING_PAYMENT', 'PAYMENT_RECEIVED', 'INSCRIBING', 'INSCRIPTION_FAILED', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "dogeAddress" TEXT NOT NULL,
    "displayName" TEXT,
    "ethAddress" TEXT,
    "linkedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthChallenge" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "dogeAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CypherNFT" (
    "id" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "rarityTier" "RarityTier" NOT NULL DEFAULT 'COMMON',
    "rarityRole" TEXT NOT NULL,
    "maskType" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "encryptionType" TEXT NOT NULL,
    "glitchLevel" TEXT NOT NULL,
    "backgroundStyle" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "traitMetadata" JSONB,
    "generationPrompt" TEXT,
    "generationModel" TEXT,
    "ipfsHash" TEXT,
    "ipfsUrl" TEXT,
    "imageUrl" TEXT,
    "inscriptionId" TEXT,
    "inscriptionTx" TEXT,
    "inscribedAt" TIMESTAMP(3),
    "status" "MintStatus" NOT NULL DEFAULT 'PENDING',
    "ownerAddress" TEXT NOT NULL,
    "userId" TEXT,
    "mintPrice" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CypherNFT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintSession" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dogeAddress" TEXT NOT NULL,
    "status" "MintStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "statusMessage" TEXT,
    "paymentAddress" TEXT,
    "paymentAmount" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "paymentTxHash" TEXT,
    "paymentConfirmedAt" TIMESTAMP(3),
    "cypherId" TEXT,
    "assignedTokenId" INTEGER,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MintSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MintLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TokenCounter" (
    "id" TEXT NOT NULL,
    "lastTokenId" INTEGER NOT NULL DEFAULT 0,
    "maxSupply" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MintAnalytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalMints" INTEGER NOT NULL DEFAULT 0,
    "successfulMints" INTEGER NOT NULL DEFAULT 0,
    "failedMints" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "legendaryMints" INTEGER NOT NULL DEFAULT 0,
    "epicMints" INTEGER NOT NULL DEFAULT 0,
    "rareMints" INTEGER NOT NULL DEFAULT 0,
    "commonMints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MintAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_dogeAddress_key" ON "User"("dogeAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_ethAddress_key" ON "User"("ethAddress");

-- CreateIndex
CREATE INDEX "User_dogeAddress_idx" ON "User"("dogeAddress");

-- CreateIndex
CREATE INDEX "User_ethAddress_idx" ON "User"("ethAddress");

-- CreateIndex
CREATE UNIQUE INDEX "AuthChallenge_nonce_key" ON "AuthChallenge"("nonce");

-- CreateIndex
CREATE INDEX "AuthChallenge_nonce_idx" ON "AuthChallenge"("nonce");

-- CreateIndex
CREATE INDEX "AuthChallenge_expiresAt_idx" ON "AuthChallenge"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CypherNFT_tokenId_key" ON "CypherNFT"("tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "CypherNFT_inscriptionId_key" ON "CypherNFT"("inscriptionId");

-- CreateIndex
CREATE INDEX "CypherNFT_tokenId_idx" ON "CypherNFT"("tokenId");

-- CreateIndex
CREATE INDEX "CypherNFT_ownerAddress_idx" ON "CypherNFT"("ownerAddress");

-- CreateIndex
CREATE INDEX "CypherNFT_status_idx" ON "CypherNFT"("status");

-- CreateIndex
CREATE INDEX "CypherNFT_rarityTier_idx" ON "CypherNFT"("rarityTier");

-- CreateIndex
CREATE INDEX "CypherNFT_inscriptionId_idx" ON "CypherNFT"("inscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "MintSession_sessionId_key" ON "MintSession"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "MintSession_cypherId_key" ON "MintSession"("cypherId");

-- CreateIndex
CREATE INDEX "MintSession_sessionId_idx" ON "MintSession"("sessionId");

-- CreateIndex
CREATE INDEX "MintSession_userId_idx" ON "MintSession"("userId");

-- CreateIndex
CREATE INDEX "MintSession_status_idx" ON "MintSession"("status");

-- CreateIndex
CREATE INDEX "MintSession_paymentAddress_idx" ON "MintSession"("paymentAddress");

-- CreateIndex
CREATE INDEX "MintLog_sessionId_idx" ON "MintLog"("sessionId");

-- CreateIndex
CREATE INDEX "MintLog_createdAt_idx" ON "MintLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "MintAnalytics_date_idx" ON "MintAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "MintAnalytics_date_key" ON "MintAnalytics"("date");

-- AddForeignKey
ALTER TABLE "CypherNFT" ADD CONSTRAINT "CypherNFT_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintSession" ADD CONSTRAINT "MintSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintSession" ADD CONSTRAINT "MintSession_cypherId_fkey" FOREIGN KEY ("cypherId") REFERENCES "CypherNFT"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MintLog" ADD CONSTRAINT "MintLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "MintSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
