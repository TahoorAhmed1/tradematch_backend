/*
  Warnings:

  - You are about to drop the column `phone_number` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "visibility" AS ENUM ('PUBLIC', 'GROUP_ONLY');

-- AlterTable
ALTER TABLE "file" ADD COLUMN     "mimeType" TEXT;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "visibility" "visibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "phone_number" TEXT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone_number";

-- AlterTable
ALTER TABLE "verification" ADD COLUMN     "phone_number" TEXT;
