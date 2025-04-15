/*
  Warnings:

  - The `region` column on the `profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "profile" DROP COLUMN "region",
ADD COLUMN     "region" TEXT;

-- DropEnum
DROP TYPE "region";
