-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('LIKE', 'COMMENT', 'SHARE', 'MESSAGE', 'CONNECTION_REQUEST', 'CONNECTION_ACCEPTED', 'GROUP_INVITE', 'GROUP_ROLE_CHANGED', 'ADMIN_ANNOUNCEMENT');

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
