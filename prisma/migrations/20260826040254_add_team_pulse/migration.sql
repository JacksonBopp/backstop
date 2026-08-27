-- CreateEnum
CREATE TYPE "SeniorityBand" AS ENUM ('IC', 'SENIOR_IC', 'MANAGER', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "WorkloadType" AS ENUM ('GENERATIVE', 'AI_VERIFICATION', 'MEETINGS', 'EXCEPTIONS');

-- CreateEnum
CREATE TYPE "PressureLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'OVERWHELMING');

-- CreateEnum
CREATE TYPE "ResourceLevel" AS ENUM ('INSUFFICIENT', 'ADEQUATE', 'STRONG');

-- CreateEnum
CREATE TYPE "TrustSignal" AS ENUM ('RELY_WITHOUT_CHECKING', 'VERIFY_ROUTINELY', 'OVERRIDE_FREQUENTLY');

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PulseResponse" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamId" TEXT NOT NULL,
    "cycle" TEXT NOT NULL,
    "seniorityBand" "SeniorityBand" NOT NULL,
    "dominantWorkload" "WorkloadType" NOT NULL,
    "demandsLevel" "PressureLevel" NOT NULL,
    "resourcesLevel" "ResourceLevel" NOT NULL,
    "trustSignal" "TrustSignal" NOT NULL,

    CONSTRAINT "PulseResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE INDEX "PulseResponse_teamId_cycle_idx" ON "PulseResponse"("teamId", "cycle");

-- AddForeignKey
ALTER TABLE "PulseResponse" ADD CONSTRAINT "PulseResponse_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
