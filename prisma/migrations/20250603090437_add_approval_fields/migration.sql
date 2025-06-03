/*
  Warnings:

  - You are about to drop the column `verified_at` on the `points` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PointStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "points" DROP COLUMN "verified_at",
ADD COLUMN     "approved_at" TIMESTAMP(0),
ADD COLUMN     "approver_id" VARCHAR(11),
ADD COLUMN     "status" "PointStatus" NOT NULL DEFAULT 'pending';
