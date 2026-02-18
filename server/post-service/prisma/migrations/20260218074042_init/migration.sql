-- AddForeignKey
ALTER TABLE "ModerationQueue" ADD CONSTRAINT "ModerationQueue_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
