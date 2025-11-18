-- CreateType
CREATE TYPE "AttachmentModuleType" AS ENUM ('CHECKIN');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "discord_id" TEXT NOT NULL,
    "streak_count" INTEGER NOT NULL DEFAULT 0,
    "streak_start" TIMESTAMP(3),
    "last_streak_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."Checkin" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "public"."Attachment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "module_id" INTEGER NOT NULL DEFAULT 0,
    "module_type" "AttachmentModuleType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "public"."User"("discord_id");
CREATE INDEX "Checkin_user_id_created_at_idx" ON "public"."Checkin"("user_id", "created_at" DESC);
CREATE INDEX "Attachment_module_idx" ON "public"."Attachment"("module_id", "module_type", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "public"."Checkin" ADD CONSTRAINT "Checkin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;