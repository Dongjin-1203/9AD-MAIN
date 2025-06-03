-- CreateEnum
CREATE TYPE "soldiers_type" AS ENUM ('enlisted', 'nco');

-- CreateEnum
CREATE TYPE "unit" AS ENUM ('headquarters', 'security', 'ammunition', 'staff');

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "soldiers_id" VARCHAR(11) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" VARCHAR(50) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points" (
    "id" SERIAL NOT NULL,
    "giver_id" VARCHAR(11) NOT NULL,
    "receiver_id" VARCHAR(11) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(0),
    "value" SMALLINT NOT NULL,
    "reason" VARCHAR(1000),
    "given_at" TIMESTAMP(0) NOT NULL,
    "rejected_at" TIMESTAMP(0),
    "rejected_reason" VARCHAR(1000),

    CONSTRAINT "points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_templates" (
    "id" SERIAL NOT NULL,
    "merit" SMALLINT,
    "demerit" SMALLINT,
    "unit" VARCHAR(10),
    "reason" VARCHAR(1000) NOT NULL,

    CONSTRAINT "point_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "used_points" (
    "id" SERIAL NOT NULL,
    "recorded_by" VARCHAR(11) NOT NULL,
    "user_id" VARCHAR(11) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" SMALLINT NOT NULL,
    "reason" VARCHAR(1000),

    CONSTRAINT "used_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soldiers" (
    "sn" VARCHAR(11) NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" VARCHAR(200) NOT NULL,
    "verified_at" TIMESTAMP(0),
    "unit" "unit" NOT NULL,
    "type" "soldiers_type" NOT NULL,
    "deleted_at" TIMESTAMP(0),
    "rejected_at" TIMESTAMP(0),
    "deleted_by" VARCHAR(36),

    CONSTRAINT "soldiers_pkey" PRIMARY KEY ("sn")
);

-- CreateTable
CREATE TABLE "overtimes" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "giver_id" VARCHAR(11) NOT NULL,
    "receiver_id" VARCHAR(11) NOT NULL,
    "approver_id" VARCHAR(11) NOT NULL,
    "verified_at" TIMESTAMP(0),
    "approved_at" TIMESTAMP(0),
    "started_at" TIMESTAMP(0) NOT NULL,
    "ended_at" TIMESTAMP(0) NOT NULL,
    "value" SMALLINT NOT NULL,
    "reason" VARCHAR(1000),
    "rejected_at" TIMESTAMP(0),
    "rejected_reason" VARCHAR(1000),
    "disapproved_at" TIMESTAMP(0),
    "disapproved_reason" VARCHAR(1000),

    CONSTRAINT "overtimes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "used_overtimes" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(11) NOT NULL,
    "recorded_by" VARCHAR(11) NOT NULL,
    "value" INTEGER NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "used_overtimes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "soldiers_sn_key" ON "soldiers"("sn");

