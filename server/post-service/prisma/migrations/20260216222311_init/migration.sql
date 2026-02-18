-- CreateTable
CREATE TABLE "link_saves" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_saves_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "link_saves_linkId_idx" ON "link_saves"("linkId");

-- CreateIndex
CREATE INDEX "link_saves_userId_idx" ON "link_saves"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "link_saves_userId_linkId_key" ON "link_saves"("userId", "linkId");

-- AddForeignKey
ALTER TABLE "link_saves" ADD CONSTRAINT "link_saves_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
