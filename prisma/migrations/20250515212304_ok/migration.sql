/*
  Warnings:

  - Made the column `original_post_user_id` on table `post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_original_post_user_id_fkey";

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "original_post_user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_original_post_user_id_fkey" FOREIGN KEY ("original_post_user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
