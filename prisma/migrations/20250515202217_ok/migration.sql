-- AlterTable
ALTER TABLE "post" ADD COLUMN     "original_post_user_id" TEXT;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_original_post_user_id_fkey" FOREIGN KEY ("original_post_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
