-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'CLIENT');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImportBatch" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "properties" INTEGER NOT NULL,
    "userZones" INTEGER NOT NULL,
    "customPlaces" INTEGER NOT NULL,
    "customDots" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "workspaceId" TEXT,

    CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyRecord" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,
    "initialPrice" DOUBLE PRECISION,
    "surface" DOUBLE PRECISION,
    "rooms" INTEGER,
    "desc" TEXT NOT NULL,
    "owned" BOOLEAN NOT NULL DEFAULT false,
    "sold" BOOLEAN NOT NULL DEFAULT false,
    "zones" TEXT[],
    "timelineYear" INTEGER,
    "workspaceId" TEXT,
    "sourceBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TimelineEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- AddForeignKey
ALTER TABLE "public"."Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImportBatch" ADD CONSTRAINT "ImportBatch_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyRecord" ADD CONSTRAINT "PropertyRecord_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyRecord" ADD CONSTRAINT "PropertyRecord_sourceBatchId_fkey" FOREIGN KEY ("sourceBatchId") REFERENCES "public"."ImportBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TimelineEvent" ADD CONSTRAINT "TimelineEvent_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "public"."Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
