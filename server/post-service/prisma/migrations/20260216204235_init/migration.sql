-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "hotScore" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Link_status_hotScore_idx" ON "Link"("status", "hotScore");
