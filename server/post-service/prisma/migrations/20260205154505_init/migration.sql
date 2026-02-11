-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VALIDATED', 'DEBUNKED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "LinkCategory" AS ENUM ('WAR', 'FOOD', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "FactCheckVerdict" AS ENUM ('VALIDATED', 'DEBUNKED');

-- CreateEnum
CREATE TYPE "SharePlatform" AS ENUM ('TWITTER', 'FACEBOOK', 'WHATSAPP', 'OTHER');

-- CreateTable
CREATE TABLE "Link" (
    "id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "url" TEXT NOT NULL,
    "description" VARCHAR(400),
    "category" "LinkCategory" NOT NULL DEFAULT 'OTHER',
    "screenRecordingUrl" TEXT,
    "userId" UUID NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'PENDING',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "factCheckerId" UUID,
    "reviewedBy" UUID,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkSource" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkLike" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkShare" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "platform" "SharePlatform",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkView" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "userId" UUID,
    "ipAddress" VARCHAR(45),
    "sessionId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkFlag" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "flaggerUserId" UUID NOT NULL,
    "flaggerRole" VARCHAR(20) NOT NULL,
    "flaggerRankLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentLike" (
    "id" UUID NOT NULL,
    "commentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactCheck" (
    "id" UUID NOT NULL,
    "postId" UUID NOT NULL,
    "factCheckerId" UUID NOT NULL,
    "verdict" "FactCheckVerdict" NOT NULL,
    "header" TEXT NOT NULL,
    "description" TEXT,
    "referenceUrls" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Link_userId_idx" ON "Link"("userId");

-- CreateIndex
CREATE INDEX "Link_status_idx" ON "Link"("status");

-- CreateIndex
CREATE INDEX "Link_category_idx" ON "Link"("category");

-- CreateIndex
CREATE INDEX "Link_createdAt_idx" ON "Link"("createdAt");

-- CreateIndex
CREATE INDEX "LinkSource_linkId_idx" ON "LinkSource"("linkId");

-- CreateIndex
CREATE INDEX "LinkLike_linkId_idx" ON "LinkLike"("linkId");

-- CreateIndex
CREATE INDEX "LinkLike_userId_idx" ON "LinkLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LinkLike_userId_linkId_key" ON "LinkLike"("userId", "linkId");

-- CreateIndex
CREATE INDEX "LinkShare_linkId_idx" ON "LinkShare"("linkId");

-- CreateIndex
CREATE INDEX "LinkShare_userId_idx" ON "LinkShare"("userId");

-- CreateIndex
CREATE INDEX "LinkView_linkId_idx" ON "LinkView"("linkId");

-- CreateIndex
CREATE INDEX "LinkView_userId_idx" ON "LinkView"("userId");

-- CreateIndex
CREATE INDEX "LinkFlag_linkId_idx" ON "LinkFlag"("linkId");

-- CreateIndex
CREATE INDEX "LinkFlag_flaggerUserId_idx" ON "LinkFlag"("flaggerUserId");

-- CreateIndex
CREATE INDEX "Comment_linkId_idx" ON "Comment"("linkId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "Comment"("parentId");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_idx" ON "CommentLike"("commentId");

-- CreateIndex
CREATE INDEX "CommentLike_userId_idx" ON "CommentLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_userId_commentId_key" ON "CommentLike"("userId", "commentId");

-- CreateIndex
CREATE INDEX "FactCheck_postId_idx" ON "FactCheck"("postId");

-- CreateIndex
CREATE INDEX "FactCheck_factCheckerId_idx" ON "FactCheck"("factCheckerId");

-- CreateIndex
CREATE UNIQUE INDEX "FactCheck_postId_factCheckerId_key" ON "FactCheck"("postId", "factCheckerId");

-- AddForeignKey
ALTER TABLE "LinkSource" ADD CONSTRAINT "LinkSource_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkLike" ADD CONSTRAINT "LinkLike_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkShare" ADD CONSTRAINT "LinkShare_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkView" ADD CONSTRAINT "LinkView_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkFlag" ADD CONSTRAINT "LinkFlag_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentLike" ADD CONSTRAINT "CommentLike_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactCheck" ADD CONSTRAINT "FactCheck_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
