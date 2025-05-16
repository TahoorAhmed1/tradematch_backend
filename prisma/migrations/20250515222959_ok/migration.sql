-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_original_post_user_id_fkey";

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "original_post_user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_original_post_user_id_fkey" FOREIGN KEY ("original_post_user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
