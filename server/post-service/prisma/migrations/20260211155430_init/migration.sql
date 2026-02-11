-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('PENDING', 'CLAIMED', 'COMPLETED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXPIRED', 'ABANDONED');

-- CreateTable
CREATE TABLE "ModerationQueue" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" "QueueStatus" NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimRecord" (
    "id" UUID NOT NULL,
    "queueId" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "factCheckerId" UUID NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "ClaimRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactCheckDraft" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "factCheckerId" UUID NOT NULL,
    "verdict" VARCHAR(20),
    "header" TEXT,
    "description" TEXT,
    "referenceUrls" TEXT[],
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactCheckDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModerationQueue_postId_key" ON "ModerationQueue"("postId");

-- CreateIndex
CREATE INDEX "ModerationQueue_status_priority_addedAt_idx" ON "ModerationQueue"("status", "priority", "addedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimRecord_queueId_key" ON "ClaimRecord"("queueId");

-- CreateIndex
CREATE INDEX "ClaimRecord_factCheckerId_status_idx" ON "ClaimRecord"("factCheckerId", "status");

-- CreateIndex
CREATE INDEX "ClaimRecord_expiresAt_status_idx" ON "ClaimRecord"("expiresAt", "status");

-- CreateIndex
CREATE UNIQUE INDEX "FactCheckDraft_postId_factCheckerId_key" ON "FactCheckDraft"("postId", "factCheckerId");

-- AddForeignKey
ALTER TABLE "ClaimRecord" ADD CONSTRAINT "ClaimRecord_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "ModerationQueue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
