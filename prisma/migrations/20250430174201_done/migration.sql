/*
  Warnings:

  - You are about to drop the `Block` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_blocked_id_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_blocker_id_fkey";

-- DropForeignKey
ALTER TABLE "Block" DROP CONSTRAINT "Block_connection_id_fkey";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "is_online" BOOLEAN DEFAULT false;

-- DropTable
DROP TABLE "Block";

-- CreateTable
CREATE TABLE "block" (
    "id" TEXT NOT NULL,
    "connection_id" TEXT NOT NULL,
    "blocker_id" TEXT NOT NULL,
    "blocked_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "block_blocker_id_blocked_id_key" ON "block"("blocker_id", "blocked_id");

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_connection_id_fkey" FOREIGN KEY ("connection_id") REFERENCES "connection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
