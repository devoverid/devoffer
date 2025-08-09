/*
  Warnings:

  - Added the required column `description` to the `Checkin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Checkin" ADD COLUMN     "description" TEXT NOT NULL;
