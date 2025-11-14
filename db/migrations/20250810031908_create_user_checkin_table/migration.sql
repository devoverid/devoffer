-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "discord_id" TEXT NOT NULL,
    "streak_count" INTEGER NOT NULL DEFAULT 0,
    "streak_start" TIMESTAMP(3),
    "last_streak_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Checkin" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Checkin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attachment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "checkin_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "public"."User"("discord_id");

-- CreateIndex
CREATE INDEX "Checkin_user_id_created_at_idx" ON "public"."Checkin"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "Attachment_checkin_id_created_at_idx" ON "public"."Attachment"("checkin_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "public"."Checkin" ADD CONSTRAINT "Checkin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attachment" ADD CONSTRAINT "Attachment_checkin_id_fkey" FOREIGN KEY ("checkin_id") REFERENCES "public"."Checkin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;