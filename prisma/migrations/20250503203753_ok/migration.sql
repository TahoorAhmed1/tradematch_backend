-- CreateEnum
CREATE TYPE "group_member_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterTable
ALTER TABLE "group_member" ADD COLUMN     "status" "group_member_status" DEFAULT 'PENDING';
