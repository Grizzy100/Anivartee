/*
  Warnings:

  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_createdAt_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "gender",
DROP COLUMN "imageUrl",
ADD COLUMN     "avatarPublicId" VARCHAR(255),
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "Gender";

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
